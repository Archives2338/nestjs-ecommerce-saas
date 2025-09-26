import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateServicePriceDescriptionDto {
  @IsNotEmpty({ message: 'El precio mínimo es requerido' })
  @IsNumber({}, { message: 'El precio mínimo debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El precio mínimo debe ser mayor o igual a 0' })
  min_price: number;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsArray({ message: 'La descripción debe ser un array' })
  @IsString({ each: true, message: 'Cada elemento de la descripción debe ser una cadena' })
  description: string[];

  @IsOptional()
  @IsString({ message: 'La descripción corta debe ser una cadena' })
  description_short?: string;

  @IsOptional()
  show_price?: boolean;

}