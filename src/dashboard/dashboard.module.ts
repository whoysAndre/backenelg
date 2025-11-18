import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';
import { ClientsModule } from 'src/clients/clients.module';
import { SalesModule } from 'src/sales/sales.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [AuthModule, ProductsModule,SalesModule]
})
export class DashboardModule { }
