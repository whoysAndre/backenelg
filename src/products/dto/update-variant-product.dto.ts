import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantProductDto } from './create-variant-product.dto';

export class UpdateVariantProductDto extends PartialType(CreateVariantProductDto) { }