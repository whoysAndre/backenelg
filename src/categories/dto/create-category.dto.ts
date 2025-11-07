import { IsOptional, IsString, MinLength } from "class-validator"

export class CreateCategoryDto {

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
