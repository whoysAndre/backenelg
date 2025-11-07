import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateVariantProductDto {
  
  @IsOptional()
  @IsString()
  id?: string;  // ← ID opcional para actualizaciones

  @IsString()
  @IsNotEmpty({ message: 'Size is required.' })
  sizes: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber({}, { message: 'Stock must be a number.' })
  @Min(0, { message: 'Stock cannot be negative.' })
  stock: number;


}
