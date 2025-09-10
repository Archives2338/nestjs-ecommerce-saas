import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServiceMultipartDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  type_id?: number;

  // icon será manejado como archivo, no como string
  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  name: string;

  @IsString()
  subtitle: string;

  @IsString()
  content: string;
 @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  type: number;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  privacy_url?: string;

  @IsOptional()
  @IsString()
  term_url?: string;

  @IsOptional()
  @IsString()
  refund_url?: string;

  @IsOptional()
  @IsString()
  promotion_url?: string;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  plan?: any;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  repayment?: any;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  sort?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  })
  active?: boolean;
}

export class UpdateServiceMultipartDto {
  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  type?: number;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  privacy_url?: string;

  @IsOptional()
  @IsString()
  term_url?: string;

  @IsOptional()
  @IsString()
  refund_url?: string;

  @IsOptional()
  @IsString()
  promotion_url?: string;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  plan?: any;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  repayment?: any;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  sort?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  })
  active?: boolean;
}
