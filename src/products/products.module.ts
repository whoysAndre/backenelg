import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { VariantProduct } from './entities/variants-product.entity';
import { CategoriesModule } from 'src/categories/categories.module';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, VariantProduct]),
    CategoriesModule
  ],
  exports:[TypeOrmModule, ProductsService]
})
export class ProductsModule { }
