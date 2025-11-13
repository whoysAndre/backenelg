import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { VariantProduct } from './entities/variants-product.entity';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ProductsService {
  //DI 
  constructor(
    private readonly categoryRepository: CategoriesService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(VariantProduct)
    private readonly variantProductRepository: Repository<VariantProduct>,
    private readonly fileService: FilesService,
    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto, image?: Express.Multer.File) {
    try {
      const { variants = [], categoryId, sku, ...restProduct } = createProductDto;

      const skuTransform = restProduct.title.toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", "")
      let product = await this.productRepository.findOne({
        where: { sku: skuTransform },
        relations: ['variantProduct', 'category'],
      });


      let imageUrl: string | undefined;
      let publicUrl: string | undefined;
      if (image) {
        const uploadResult = await this.fileService.uploadImageToCloudinary(image);
        imageUrl = uploadResult.url;
        publicUrl = uploadResult.public_id;
      }

      if (!product) {

        const category = await this.categoryRepository.findOne(categoryId);

        product = this.productRepository.create({
          ...restProduct,
          sku,
          category,
          imageUrl,
          publicUrl,
        });

        await this.productRepository.save(product);
      }


      if (variants && variants.length > 0) {
        const newVariants = variants.map((variant) =>
          this.variantProductRepository.create({
            sizes: variant.sizes,
            color: variant.color,
            stock: variant.stock,
            product,
          }),
        );

        await this.variantProductRepository.save(newVariants);
      }


      return await this.productRepository.findOne({
        where: { id: product.id },
        relations: ['variantProduct', 'category'],
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message || 'Error creating product');
    }
  }

  async findAll() {
    const products = await this.productRepository.find({
      relations: {
        variantProduct: true,
        category: true
      },
      where: {
        isActive: true
      },

    });
    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id
      },
      relations: {
        category: true
      }
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
      console.log(product);
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
