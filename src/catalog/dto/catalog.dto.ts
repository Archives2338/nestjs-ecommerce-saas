import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ClassifyTabDto {
  @IsNumber()
  id: number;

  @IsString()
  path: string;

  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  icon_selected: string;
}

export class StatisticsDto {
  @IsNumber()
  @IsOptional()
  memberNum?: number;

  @IsNumber()
  @IsOptional()
  peopleNum?: number;

  @IsNumber()
  @IsOptional()
  year?: number;
}

export class RecentOrderDto {
  @IsString()
  out_trade_no: string;

  @IsString()
  user_name: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  create_time: string;

  @IsNumber()
  @IsOptional()
  show_status?: number;

  @IsString()
  time: string;
}

export class SpuDto {
  @IsString()
  @IsOptional()
  serviceId?: string; // 🎯 ObjectId del servicio (principal) - opcional por compatibilidad

  @IsNumber()
  @IsOptional()
  type_id?: number; // 📋 Mantenido para compatibilidad temporal

  @IsString()
  @IsOptional()
  serviceRef?: string; // 🔗 Referencia legacy - opcional por compatibilidad

  @IsString()
  type_name: string;

  @IsString()
  detail_route: string;

  @IsBoolean()
  @IsOptional()
  is_netflix?: boolean;

  @IsString()
  image: string;

  @IsNumber()
  @IsOptional()
  image_type?: number;

  @IsString()
  @IsOptional()
  thumb_img?: string;

  @IsString()
  min_price: string;

  @IsString()
  @IsOptional()
  currency_icon1?: string;

  @IsString()
  @IsOptional()
  currency_icon2?: string;

  @IsNumber()
  @IsOptional()
  currency_show_type?: number;

  @IsNumber()
  @IsOptional()
  vip_status?: number;

  @IsNumber()
  @IsOptional()
  lock_status?: number;

  @IsNumber()
  @IsOptional()
  rank?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RecentOrderDto)
  recent_order?: RecentOrderDto[];

  @IsArray()
  @IsOptional()
  description?: string[];

  @IsString()
  @IsOptional()
  description_short?: string;


  
  @IsOptional()
  show_price?: boolean;

  @IsArray()
  @IsOptional()
  prompt?: string[];
}

export class CategoryListDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  type_name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpuDto)
  spuList: SpuDto[];
}

export class GetTypeClassifyListDto {
  @IsString()
  language: string;

  @IsString()
  @IsOptional()
  promote?: string;
}

export class UpdateCatalogDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ClassifyTabDto)
  classify_tab?: ClassifyTabDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
  statistics?: StatisticsDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CategoryListDto)
  list?: CategoryListDto[];

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  promote?: string;
}
