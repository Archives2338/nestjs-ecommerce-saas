import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSkuListDto {
  @IsString()
  language: string;

  @IsNumber()
  type_id: number;

  @IsNumber()
  source: number;
}

export class PlanItemDto {
  @IsNumber()
  month_id: number;

  @IsNumber()
  month: number;

  @IsString()
  month_content: string;

  @IsNumber()
  screen_id: number;

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

  @IsNumber()
  type_plan_id: number;

  @IsNumber()
  sort: number;

  @IsString()
  currency_icon1: string;

  @IsString()
  currency_icon2: string;

  @IsNumber()
  currency_show_type: number;

  @IsString()
  original_price: string;

  @IsString()
  sale_price: string;

  @IsString()
  average_price: string;

  @IsString()
  discount: string;
}

export class ScreenOptionDto {
  @IsNumber()
  screen_id: number;

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

  @IsNumber()
  sort: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanItemDto)
  month: PlanItemDto[];
}

export class MonthOptionDto {
  @IsNumber()
  month_id: number;

  @IsNumber()
  month: number;

  @IsString()
  month_content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanItemDto)
  screen: PlanItemDto[];
}

export class ServicePlansDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonthOptionDto)
  month: MonthOptionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScreenOptionDto)
  screen: ScreenOptionDto[];

  @IsOptional()
  @IsNumber()
  default_month_id?: number;

  @IsOptional()
  @IsNumber()
  default_screen_id?: number;
}

export class CreateServiceDto {
  @IsString()
  language: string;

  @IsNumber()
  type_id: number;

  @IsString()
  icon: string;

  @IsString()
  name: string;

  @IsString()
  subtitle: string;

  @IsString()
  content: string;

  @IsNumber()
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

  @ValidateNested()
  @Type(() => ServicePlansDto)
  plan: ServicePlansDto;

  @ValidateNested()
  @Type(() => ServicePlansDto)
  repayment: ServicePlansDto;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateServiceDto {
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
  @IsNumber()
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
  @ValidateNested()
  @Type(() => ServicePlansDto)
  plan?: ServicePlansDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServicePlansDto)
  repayment?: ServicePlansDto;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

// ==================== DTOs PARA ADMINISTRACIÓN ====================

export class GetAllServicesAdminDto {
  @IsOptional()
  @IsString()
  language?: string = 'es';

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '10';
}

export class AdminServiceSummaryDto {
  id: string;
  type_id: number;
  name: string;
  subtitle: string;
  icon: string;
  active: boolean;
  sort: number;
  created_at: Date;
  updated_at: Date;
  total_plans: number;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  summary: {
    total_months: number;
    total_screens: number;
    has_repayment: boolean;
  };
}

export class AdminServicesStatsDto {
  overview: {
    total_services: number;
    active_services: number;
    inactive_services: number;
    services_with_plans: number;
    total_plans: number;
  };
  popular_services: Array<{
    id: number;
    name: string;
    sort_order: number;
  }>;
  last_updated: string;
}
