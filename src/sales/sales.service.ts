import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ClientsService } from 'src/clients/clients.service';
import { Between, DataSource, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { DetailSale } from './entities/detail-sale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { VariantProduct } from 'src/products/entities/variants-product.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class SalesService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly clientService: ClientsService,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) { }

  async create(createSaleDto: CreateSaleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { clientId, details, status } = createSaleDto;
      const client = await this.clientService.findOne(clientId);

      let total = 0;
      const detailEntities: DetailSale[] = [];
      const productsToCheck = new Set<string>();

      for (const d of details) {
        const variant = await queryRunner.manager.findOne(VariantProduct, {
          where: { id: d.variantProductId },
          relations: ['product'],
        });

        if (!variant) {
          throw new BadRequestException(
            `Variant with id ${d.variantProductId} not found`
          );
        }

        if (variant.stock < d.quantity) {
          throw new BadRequestException(
            `Not enough stock for variant ${variant.id}. Available: ${variant.stock}, Requested: ${d.quantity}`
          );
        }

        const subtotal = d.quantity * d.unitPrice;
        total += subtotal;

        const detail = queryRunner.manager.create(DetailSale, {
          quantity: d.quantity,
          unitPrice: d.unitPrice,
          subtotal,
          variantProductId: variant.id,
          productTitle: variant.product.title,
          variantSizes: variant.sizes,
          variantColor: variant.color,
          productSku: variant.product.sku,
          variantProduct: variant,
        });

        detailEntities.push(detail);

        variant.stock -= d.quantity;
        await queryRunner.manager.save(variant);

        productsToCheck.add(variant.product.id);
      }

      const sale = queryRunner.manager.create(Sale, {
        client,
        total,
        status,
        details: detailEntities,
      });

      await queryRunner.manager.save(sale);

      // Verificar y actualizar estado de productos
      for (const productId of productsToCheck) {
        const variants = await queryRunner.manager.find(VariantProduct, {
          where: { product: { id: productId } },
        });

        const hasStock = variants.some(v => v.stock > 0);

        await queryRunner.manager.update(
          Product,
          { id: productId },
          { isActive: hasStock }
        );
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Sale created successfully',
        sale: {
          id: sale.id,
          total: sale.total,
          client: sale.client,
          details: sale.details,
        },
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating sale');

    } finally {
      await queryRunner.release();
    }
  }


  async findAll() {
    return this.saleRepository.find({
      relations: ['client', 'details'],
      where: {
        isActive: true
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {

    const sale = await this.saleRepository.findOne({
      where: { id, isActive: true },
      relations: ['client', 'details'],
    });

    if (!sale) throw new NotFoundException(`Sale with id ${id} not found`);


    return sale;
  }


  async remove(id: string) {
    const sale = await this.findOne(id);
    sale.isActive = false;
    sale.updatedAt = new Date();
    await this.saleRepository.save(sale);
  }


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
