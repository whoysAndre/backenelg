import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ClientsService } from 'src/clients/clients.service';
import { DataSource, Repository } from 'typeorm';
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

      const { clientId, details, total, status } = createSaleDto;

      //1° Get client
      const client = await this.clientService.findOne(clientId);

      //2° Create Sale
      const sale = this.saleRepository.create({
        client,
        total,
        status
      });

      await queryRunner.manager.save(sale);


      //3° Create Detail Sale
      for (const d of details) {
        const variant = await this.variantRepository.findOne({
          where: {
            id: d.variantProductId
          }
        });
        if (!variant) throw new BadRequestException(`Variant with id ${d.variantProductId} not found`);

        const detail = this.detailSaleRepository.create({
          sale,
          variantProduct: variant,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
          subtotal: d.subtotal
        });

        await queryRunner.manager.save(detail);
        variant.stock -= d.quantity;
        await queryRunner.manager.save(variant);

      }
      await queryRunner.commitTransaction();
      return { message: 'Sale created successfully', sale };
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
        relations: ['details'],
      });
      if (!sale) throw new NotFoundException(`Sale not found`);
      const { total, status, details } = updateSaleDto;

      // Update basic fields
      sale.total = total ?? sale.total;
      sale.status = status ?? sale.status;

      if (details) {
        await queryRunner.manager.delete(DetailSale, { sale: { id } });

        for (const d of details) {
          const variant = await this.variantRepository.findOne({
            where: { id: d.variantProductId },
          });
          if (!variant)
            throw new BadRequestException(
              `Variant with id ${d.variantProductId} not found`,
            );

          const detail = this.detailSaleRepository.create({
            sale,
            variantProduct: variant,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            subtotal: d.subtotal,
          });

          await queryRunner.manager.save(detail);
        }
      }

      await queryRunner.manager.save(sale);
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
}
