import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSkuListDto {
  @IsString()
  language: string;

  @IsNumber()
  type_id: number;

  @IsNumber()
  source: number;

  @IsOptional()
  @IsNumber()
  type?: number;
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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  metadata?: {
    category?: string;
    region?: string;
    supportedDevices?: string[];
    totalPlans?: number;
  };
}

export class UpdateServiceDto {
  @IsOptional()
  @IsNumber()
  show_status?: number;

  @IsOptional()
  @IsString()
  type_name?: string;

  @IsOptional()
  @IsString()
  thumb_img?: string;

  @IsOptional()
  @IsString()
  selectInfo?: string;

  @IsOptional()
  @IsBoolean()
  sku_style_status?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServicePlansDto)
  plan?: ServicePlansDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServicePlansDto)
  repayment?: ServicePlansDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Clase de respuesta que coincide con la API de referencia
export class SkuListResponseDto {
  @IsNumber()
  code: number;

  @IsString()
  message: string;

  @IsNumber()
  toast: number;

  @IsString()
  redirect_url: string;

  @IsString()
  type: string;

  @ValidateNested()
  @Type(() => SkuListDataDto)
  data: SkuListDataDto;
}

export class SkuListDataDto {
  @IsNumber()
  id: number;

  @IsNumber()
  show_status: number;

  @IsString()
  type_name: string;

  @IsString()
  thumb_img: string;

  @IsString()
  selectInfo: string;

  @IsBoolean()
  sku_style_status: boolean;

  @ValidateNested()
  @Type(() => ServicePlansDto)
  plan: ServicePlansDto;

  @ValidateNested()
  @Type(() => ServicePlansDto)
  repayment: ServicePlansDto;
}
