import { IsNumber, IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetailSaleDto {


  @IsOptional()
  @IsString()
  id?: string;  // ← ID opcional para actualizaciones

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  unitPrice: number;

  @IsUUID()
  @IsOptional()
  saleId?: string;

  @IsUUID()
  @IsNotEmpty()
  variantProductId: string;
  
}
