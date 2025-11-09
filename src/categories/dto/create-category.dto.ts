import { IsOptional, IsString, IsUUID, MinLength } from "class-validator"

export class CreateCategoryDto {

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsUUID('4', { message: 'The ID of category should be a UUID valid.' })
  userId: string;

}
