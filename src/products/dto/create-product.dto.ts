import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateVariantProductDto } from "./create-variant-product.dto";
import { plainToInstance, Transform, Type } from "class-transformer";

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
  @Transform(({ value }) => {
    return typeof value === 'string' ? parseFloat(value) : value
  })
  price: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID('4', { message: 'The ID of category should be a UUID valid.' })
  categoryId: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? parsed.map((v) => plainToInstance(CreateVariantProductDto, v))
          : [];
      } catch (error) {
        console.error('❌ Error al parsear variants:', error);
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantProductDto)
  variants: CreateVariantProductDto[];

}
