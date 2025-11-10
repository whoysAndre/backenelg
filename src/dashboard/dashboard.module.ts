import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [ AuthModule,ProductsModule ]
})
export class DashboardModule {}
