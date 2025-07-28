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

  @IsString()
  save_amount: string;

  @IsString()
  week_price: string;

  @IsString()
  product_id: string;

  @IsString()
  product_key: string;

  @IsString()
  discount_amount: string;

  @IsString()
  discounted_price: string;

  @IsString()
  week_content: string;

  @IsString()
  original_price: string;

  @IsBoolean()
  highlight: boolean;

  @IsString()
  label: string;

  @IsNumber()
  offer_id: number;

  @IsNumber()
  type: number;

  @IsNumber()
  time: number;

  @IsString()
  currency: string;
}

export class ScreenOptionDto {
  @IsNumber()
  screen_id: number;

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
