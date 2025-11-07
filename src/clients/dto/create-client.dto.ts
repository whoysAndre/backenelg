import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'The name is required.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'The lastname is required.' })
  lastname: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9+\-()\s]*$/, { message: 'The phone contain invalid characters.' })
  phone?: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}
