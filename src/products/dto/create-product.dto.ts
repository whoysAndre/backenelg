import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateVariantProductDto } from "./create-variant-product.dto";
import { Type } from "class-transformer";

export class CreateProductDto {
  
  @IsString()
  @IsNotEmpty({ message: 'The title is required.' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku: string;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'The price should be a number valid.' },
  )
  @IsPositive({ message: 'The price should be greater than 0.' })
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID('4', { message: 'The ID of category should be a UUID valid.' })
  categoryId: string;

  //@IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(()=>CreateVariantProductDto  )
  variants: CreateVariantProductDto[] 

}
