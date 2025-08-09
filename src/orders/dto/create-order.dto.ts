import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsNumber()
  profiles?: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string; // ID del servicio (Netflix, Disney+)

  @IsNumber()
  @IsNotEmpty()
  type_plan_id: number; // ID específico del plan (1011, 1151, etc.)

  @IsEnum(['yape', 'plin', 'transferencia'])
  paymentMethod: 'yape' | 'plin' | 'transferencia';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  promo_code?: string;

  @IsOptional()
  @IsString()
  customer?: string; // Para casos sin JWT
}

export class UpdateOrderStatusDto {
  @IsEnum(['pendiente', 'pagado', 'completado', 'cancelado', 'verificacion_manual'])
  status: 'pendiente' | 'pagado' | 'completado' | 'cancelado' | 'verificacion_manual';

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AttachComprobanteDto {
  @IsOptional()
  @IsString()
  comprobanteUrl?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    // Convertir string a número si es necesario
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  paymentAmount?: number;
}
