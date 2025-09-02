import { IsNumber, IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ================== MONTH OPTION DTOs ==================

export class CreateServiceMonthOptionDto {
  @IsNumber()
  month: number;

  @IsString()
  month_content: string;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateServiceMonthOptionDto {
  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsString()
  month_content?: string;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// ================== SCREEN OPTION DTOs ==================

export class CreateServiceScreenOptionDto {
  @IsNumber()
  max_user: number;

  @IsNumber()
  substitute_recharge: number;

  @IsNumber()
  screen: number;

  @IsString()
  screen_content: string;

  @IsString()
  seat_type: string;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateServiceScreenOptionDto {
  @IsOptional()
  @IsNumber()
  max_user?: number;

  @IsOptional()
  @IsNumber()
  substitute_recharge?: number;

  @IsOptional()
  @IsNumber()
  screen?: number;

  @IsOptional()
  @IsString()
  screen_content?: string;

  @IsOptional()
  @IsString()
  seat_type?: string;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// ================== SERVICE PLAN DTOs ==================

export class CreateServicePlanDto {
  @IsNumber()
  month_id: number;

  @IsNumber()
  screen_id: number;

  @IsEnum(['plan', 'repayment'])
  plan_type: 'plan' | 'repayment';

  @IsOptional()
  @IsString()
  currency_icon1?: string;

  @IsOptional()
  @IsString()
  currency_icon2?: string;

  @IsOptional()
  @IsNumber()
  currency_show_type?: number;

  @IsNumber()
  original_price: number;

  @IsNumber()
  sale_price: number;

  @IsNumber()
  average_price: number;

  @IsOptional()
  @IsString()
  discount?: string;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateServicePlanDto {
  @IsOptional()
  @IsNumber()
  month_id?: number;

  @IsOptional()
  @IsNumber()
  screen_id?: number;

  @IsOptional()
  @IsEnum(['plan', 'repayment'])
  plan_type?: 'plan' | 'repayment';

  @IsOptional()
  @IsString()
  currency_icon1?: string;

  @IsOptional()
  @IsString()
  currency_icon2?: string;

  @IsOptional()
  @IsNumber()
  currency_show_type?: number;

  @IsOptional()
  @IsNumber()
  original_price?: number;

  @IsOptional()
  @IsNumber()
  sale_price?: number;

  @IsOptional()
  @IsNumber()
  average_price?: number;

  @IsOptional()
  @IsString()
  discount?: string;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// ================== QUERY DTOs ==================

export class GetServicePlansDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsNumber()
  month_id?: number;

  @IsOptional()
  @IsNumber()
  screen_id?: number;

  @IsOptional()
  @IsEnum(['plan', 'repayment'])
  plan_type?: 'plan' | 'repayment';

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// ================== BULK UPDATE DTOs ==================

export class BulkUpdatePricesDto {
  @IsString()
  serviceId: string;

  @IsNumber()
  priceMultiplier: number;

  @IsOptional()
  @IsEnum(['plan', 'repayment'])
  plan_type?: 'plan' | 'repayment';
}

export class CreateCompleteServiceDto {
  @IsString()
  serviceId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceMonthOptionDto)
  months?: CreateServiceMonthOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceScreenOptionDto)
  screens?: CreateServiceScreenOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServicePlanDto)
  plans?: CreateServicePlanDto[];
}
