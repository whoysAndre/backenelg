import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusSale } from '../enums/sale.enum';
import { CreateDetailSaleDto } from './create-detail-sale.dto';

export class CreateSaleDto {
  
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  total: number;

  @IsEnum(StatusSale)
  @IsOptional()
  status?: StatusSale;

  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetailSaleDto)
  details: CreateDetailSaleDto[];

}
