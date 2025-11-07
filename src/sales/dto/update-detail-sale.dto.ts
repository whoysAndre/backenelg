import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailSaleDto } from './create-detail-sale.dto';

export class UpdateDetailSaleDto extends PartialType(CreateDetailSaleDto) { }
