import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CommonModule } from 'src/common/common.module';
import { SalesModule } from 'src/sales/sales.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ReportsService],
  controllers: [ReportsController],
  imports: [ CommonModule,SalesModule, AuthModule ]
})
export class ReportsModule {}
