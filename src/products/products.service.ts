import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { VariantProduct } from './entities/variants-product.entity';

@Injectable()
export class ProductsService {

  //DI 
  constructor(
    private readonly categoryRepository: CategoriesService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(VariantProduct)
    private readonly variantProductRepository: Repository<VariantProduct>,

    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const { variants = [], categoryId, ...restProduct } = createProductDto;
      const category = await this.categoryRepository.findOne(categoryId);

      const product = this.productRepository.create({
        ...restProduct,
        category,
        variantProduct: variants.map((variant) => this.variantProductRepository.create({
          sizes: variant.sizes,
          color: variant.color,
          stock: variant.stock
        }))
      });

      return await this.productRepository.save(product);

    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    const products = await this.productRepository.find({
      relations: {
        variantProduct: true
      },
      where: {
        isActive: true
      }
    });
    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({
      id
    });
    if (!product) throw new NotFoundException(`Product whit id: ${id} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const { variants = [], categoryId, ...toUpdate } = updateProductDto;
      const product = await this.productRepository.findOne({
        where: {
          id
        },
        relations: ["variantProduct"]
      });

      if (!product) throw new NotFoundException('Product not found');

      let category = product.category;
      if (categoryId) {
        category = await this.categoryRepository.findOne(categoryId);
      }

      const updatedProduct = await this.productRepository.preload({
        id,
        ...toUpdate,
        category
      });

      if (!updatedProduct) throw new NotFoundException('Product not found during preload');


      //Variants
      const updatedVariants: VariantProduct[] = [];
      for (const variant of variants) {
        if (variant.id) {
          const existingVariant = await this.variantProductRepository.findOneBy({
            id: variant.id
          })

          if (!existingVariant) {
            throw new NotFoundException(`Variant with ID ${variant.id} not found`);
          }

          const updatedVariant = await this.variantProductRepository.preload({
            id: variant.id,
            ...variant
          });

          if (!updatedVariant) throw new NotFoundException('Product not found during preload');

          await this.variantProductRepository.save(updatedVariant)
          updatedVariants.push(updatedVariant);

        } else {

          //Create new Variant
          const newVariant = this.variantProductRepository.create({
            sizes: variant.sizes,
            color: variant.color,
            stock: variant.stock,
            product: updatedProduct
          });
          const savedProduct = await this.variantProductRepository.save(newVariant);
          updatedVariants.push(savedProduct);

        }
      }

      const existingVariants = await this.variantProductRepository.find({
        where: {
          product: { id }
        }
      })

      const incomingVariantIds = variants
        .map(v => v.id)
        .filter(id => id !== undefined && id !== null);

      const variantsToDelete = existingVariants.filter(
        existingVariant => !incomingVariantIds.includes(existingVariant.id)
      );

      if (variantsToDelete.length > 0) {
        await this.variantProductRepository.remove(variantsToDelete);
      }

      updatedProduct.variantProduct = updatedVariants;

      const savedProduct = await this.productRepository.save(updatedProduct);
      await queryRunner.commitTransaction();

      return {
        message: 'Product and variants updated successfully',
        product: savedProduct
      };


    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {

    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.isActive = false;

    return await this.productRepository.save(product);

  }

}
