import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { DetailSale } from './entities/detail-sale.entity';
import { ClientsModule } from 'src/clients/clients.module';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [
    TypeOrmModule.forFeature([Sale, DetailSale]),
    ClientsModule,
    ProductsModule,
    AuthModule
  ],
  exports: [SalesService]
})
export class SalesModule { }
