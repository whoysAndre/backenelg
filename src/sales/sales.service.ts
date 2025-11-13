import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ClientsService } from 'src/clients/clients.service';
import { Between, DataSource, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { DetailSale } from './entities/detail-sale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { VariantProduct } from 'src/products/entities/variants-product.entity';

@Injectable()
export class SalesService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly clientService: ClientsService,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(DetailSale)
    private readonly detailSaleRepository: Repository<DetailSale>,
    @InjectRepository(VariantProduct)
    private readonly variantRepository: Repository<VariantProduct>
  ) { }



  async create(createSaleDto: CreateSaleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { clientId, details, status } = createSaleDto;

      // 1️⃣ Obtener cliente
      const client = await this.clientService.findOne(clientId);

      // 2️⃣ Calcular subtotales y total general
      let total = 0;
      const detailEntities: DetailSale[] = [];

      for (const d of details) {
        const variant = await this.variantRepository.findOne({
          where: { id: d.variantProductId },
        });

        if (!variant)
          throw new BadRequestException(`Variant with id ${d.variantProductId} not found`);

        // Calcula subtotal automáticamente
        const subtotal = d.quantity * d.unitPrice;
        total += subtotal;

        // Crea entidad de detalle
        const detail = this.detailSaleRepository.create({
          quantity: d.quantity,
          unitPrice: d.unitPrice,
          subtotal,
          variantProduct: variant,
        });

        detailEntities.push(detail);

        // Actualizar stock del producto
        if (variant.stock < d.quantity) {
          throw new BadRequestException(`Not enough stock for variant ${variant.id}`);
        }
        variant.stock -= d.quantity;
        await queryRunner.manager.save(variant);
      }

      // 3️⃣ Crear la venta
      const sale = this.saleRepository.create({
        client,
        total,
        status,
        details: detailEntities, // relación
      });

      await queryRunner.manager.save(sale);

      // 4️⃣ Guardar detalles (con la relación a la venta ya creada)
      for (const detail of detailEntities) {
        detail.sale = sale;
        await queryRunner.manager.save(detail);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Sale created successfully',
        sale: {
          id: sale.id,
          total: sale.total,
          client: sale.client,
          details: detailEntities,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }


  async findAll() {
    return this.saleRepository.find({
      relations: ['client', 'details', 'details.variantProduct'],
      where: {
        isActive: true
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const sale = await this.saleRepository.findOne({
      where: { id, isActive: true },
      relations: ['client', 'details', 'details.variantProduct'],
    });

    if (!sale) throw new NotFoundException(`Sale with id ${id} not found`);
    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await this.saleRepository.findOne({
        where: { id },
        relations: ['details', 'details.variantProduct'],
      });

      if (!sale) throw new NotFoundException(`Sale not found`);

      const { status, details = [] } = updateSaleDto;


      for (const oldDetail of sale.details) {
        const variant = await this.variantRepository.findOne({
          where: { id: oldDetail.variantProduct.id },
        });
        if (variant) {
          variant.stock += oldDetail.quantity;
          await queryRunner.manager.save(variant);
        }
      }


      await queryRunner.manager.delete(DetailSale, { sale: { id } });

      let total = 0;
      const newDetails: DetailSale[] = [];

      for (const d of details) {
        const variant = await this.variantRepository.findOne({
          where: { id: d.variantProductId },
        });

        if (!variant)
          throw new BadRequestException(`Variant with id ${d.variantProductId} not found`);

        if (variant.stock < d.quantity)
          throw new BadRequestException(`Not enough stock for variant ${variant.id}`);

        const subtotal = d.quantity * d.unitPrice;
        total += subtotal;

        const detail = this.detailSaleRepository.create({
          sale,
          variantProduct: variant,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
          subtotal,
        });

        newDetails.push(detail);


        variant.stock -= d.quantity;
        await queryRunner.manager.save(variant);
      }


      sale.status = status ?? sale.status;
      sale.total = total;
      sale.details = newDetails;

      await queryRunner.manager.save(sale);


      for (const detail of newDetails) {
        await queryRunner.manager.save(detail);
      }

      await queryRunner.commitTransaction();

      return { message: 'Sale updated successfully', sale };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }


  async remove(id: string) {

    const sale = await this.findOne(id);

    sale.isActive = false;
    sale.updatedAt = new Date();

    await this.saleRepository.save(sale);

  }





  //13/10/2025

async getSalesByMonth(year?: number) {
  const targetYear = year || new Date().getFullYear();

  //  Obtener todas las ventas del año usando 
  const sales = await this.saleRepository.find({
    where: {
      isActive: true,
      createdAt: Between(
        new Date(`${targetYear}-01-01`),
        new Date(`${targetYear}-12-31 23:59:59`)
      ),
    },
    select: ['id', 'total', 'createdAt'],
  });

  //  Procesar ventas y agrupar por mes
  const salesByMonth = new Map<number, { totalSales: number; salesCount: number }>();
  let totalAnnualSales = 0;
  let totalSalesCount = 0;

  sales.forEach(sale => {
    const month = sale.createdAt.getMonth() + 1; 
    const total = Number(sale.total);

    const current = salesByMonth.get(month) || { totalSales: 0, salesCount: 0 };
    
    salesByMonth.set(month, {
      totalSales: current.totalSales + total,
      salesCount: current.salesCount + 1,
    });

    totalAnnualSales += total;
    totalSalesCount += 1;
  });

  //  Nombres de meses
  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar array completo de 12 meses
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const data = salesByMonth.get(month);

    return {
      month,
      monthName: MONTH_NAMES[i],
      totalSales: data?.totalSales ?? 0,
      salesCount: data?.salesCount ?? 0,
    };
  });

  return {
    year: targetYear,
    totalAnnualSales,
    totalSalesCount,
    monthlyData,
  };
}




}
