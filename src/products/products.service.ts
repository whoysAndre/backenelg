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

  async update(id: string, updateProductDto: UpdateProductDto, image?: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    const productRepo = queryRunner.manager.getRepository(Product);
    const variantRepo = queryRunner.manager.getRepository(VariantProduct);

    try {
      const { variants = [], categoryId, ...toUpdate } = updateProductDto;

      const product = await productRepo.findOne({
        where: { id },
        relations: ['variantProduct', 'category'],
      });

      if (!product) throw new NotFoundException('Product not found');

      if (image) {
        const uploadResult = await this.fileService.updateImage(product.publicUrl, image);
        product.imageUrl = uploadResult.url;
        product.publicUrl = uploadResult.public_id;
      }

      let category = product.category;
      if (categoryId) {
        category = await this.categoryRepository.findOne(categoryId);
      }

      const updatedProductData: Partial<Product> = {
        id,
        ...toUpdate,
        imageUrl: product.imageUrl,
        publicUrl: product.publicUrl,
        category,
      };

      const updatedProduct = await productRepo.preload(updatedProductData as any);
      if (!updatedProduct) throw new NotFoundException('Product not found during preload');

      const updatedVariants: VariantProduct[] = [];

      const existingVariants = product.variantProduct ?? [];
      const existingById = new Map(existingVariants.map(v => [String(v.id), v]));

      const incomingVariantIds = variants
        .map(v => v.id)
        .filter(idv => idv !== undefined && idv !== null)
        .map(idv => String(idv));

      for (const variant of variants) {
        if (variant.id) {
          const existing = existingById.get(String(variant.id));
          if (!existing) {
            throw new NotFoundException(`Variant with ID ${variant.id} not found`);
          }

          const updatedVariant = await variantRepo.preload({
            id: variant.id,
            ...variant,
          } as any);

          if (!updatedVariant) throw new NotFoundException('Variant preload failed');
          await variantRepo.save(updatedVariant);
          updatedVariants.push(updatedVariant);
        } else {

          const newVariant = variantRepo.create({
            sizes: variant.sizes,
            color: variant.color,
            stock: variant.stock,
            product: updatedProduct,
          });
          const saved = await variantRepo.save(newVariant);
          updatedVariants.push(saved);
        }
      }

      const variantsToDelete = existingVariants.filter(ev => !incomingVariantIds.includes(String(ev.id)));
      if (variantsToDelete.length > 0) {
        await variantRepo.remove(variantsToDelete);
      }

      updatedProduct.variantProduct = updatedVariants;

      await productRepo.save(updatedProduct);

      await queryRunner.commitTransaction();

      return {
        message: 'Product and variants updated successfully',
        status: true
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || 'Error updating product');
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
