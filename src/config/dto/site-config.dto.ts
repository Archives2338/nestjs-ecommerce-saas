import { IsString, IsNumber, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class NavigationItemDto {
  @IsString()
  name: string;

  @IsString()
  key_word: string;

  @IsNumber()
  @IsOptional()
  target_blank?: number;

  @IsString()
  link_url: string;
}

export class LogoConfigDto {
  @IsString()
  url: string;

  @IsNumber()
  @IsOptional()
  type?: number;

  @IsString()
  @IsOptional()
  not_theme_url?: string;

  @IsNumber()
  @IsOptional()
  not_theme_type?: number;

  @IsNumber()
  @IsOptional()
  origin_type?: number;
}

export class UserCenterMenuItemDto {
  @IsString()
  name: string;

  @IsString()
  key_word: string;

  @IsString()
  @IsOptional()
  link_url?: string;

  @IsNumber()
  @IsOptional()
  link_rule?: number;

  @IsNumber()
  @IsOptional()
  is_block?: number;

  @IsString()
  default_icon: string;

  @IsString()
  selected_icon: string;
}

export class NetflixConfigDto {
  @IsNumber()
  @IsOptional()
  crisp_switch?: number;

  @IsNumber()
  @IsOptional()
  get_code?: number;

  @IsNumber()
  @IsOptional()
  appease_status?: number;

  @IsNumber()
  @IsOptional()
  affiliate_term?: number;

  @IsNumber()
  @IsOptional()
  netflix_change?: number;

  @IsNumber()
  @IsOptional()
  order_rank_rate?: number;

  @IsNumber()
  @IsOptional()
  user_country_status?: number;

  @IsNumber()
  @IsOptional()
  netflix_suspends_top?: number;

  @IsNumber()
  @IsOptional()
  netflix_suspends_middle?: number;

  @IsNumber()
  @IsOptional()
  spotify_fault_apply_status?: number;

  @IsNumber()
  @IsOptional()
  netflix_fault_apply_status?: number;

  @IsNumber()
  @IsOptional()
  spotify_service_guide_refund_credit?: number;

  @IsNumber()
  @IsOptional()
  netflix_service_guide_refund_credit?: number;

  @IsNumber()
  @IsOptional()
  netflix_vpn_check?: number;

  @IsNumber()
  @IsOptional()
  supply_update_status?: number;

  @IsOptional()
  supply_update_time?: Date;

  @IsNumber()
  @IsOptional()
  gamsai_divert_switch?: number;

  @IsNumber()
  @IsOptional()
  change_plan_style?: number;
}

export class GetSiteConfigDto {
  @IsString()
  language: string;
}

export class UpdateSiteConfigDto {
  @IsNumber()
  @IsOptional()
  trustpilot_footer?: number;

  @IsNumber()
  @IsOptional()
  trustpilot_affiliate?: number;

  @IsNumber()
  @IsOptional()
  help_center?: number;

  @IsNumber()
  @IsOptional()
  questionnaire?: number;

  @IsNumber()
  @IsOptional()
  gosplit_guide?: number;

  @IsNumber()
  @IsOptional()
  gosplit_guide_sku_detail?: number;

  @IsNumber()
  @IsOptional()
  gosplit_guide_pay_result?: number;

  @IsNumber()
  @IsOptional()
  gosplit_guide_lock_alter?: number;

  @IsString()
  @IsOptional()
  subject_information?: string;

  @IsString()
  @IsOptional()
  index_top_tips?: string;

  @IsNumber()
  @IsOptional()
  crisp_login_switch?: number;

  @IsNumber()
  @IsOptional()
  crisp_not_login_switch?: number;

  @IsNumber()
  @IsOptional()
  cookie_pop_up?: number;

  @ValidateNested()
  @Type(() => LogoConfigDto)
  @IsOptional()
  head_logo_b?: LogoConfigDto;

  @IsNumber()
  @IsOptional()
  crisp_flow_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  @IsOptional()
  navigation?: NavigationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  @IsOptional()
  navigation_footer?: NavigationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserCenterMenuItemDto)
  @IsOptional()
  user_center_menu?: UserCenterMenuItemDto[];

  @IsBoolean()
  @IsOptional()
  show_year_review?: boolean;

  @IsNumber()
  @IsOptional()
  youtubeNum?: number;

  @IsNumber()
  @IsOptional()
  netflixNum?: number;

  @IsBoolean()
  @IsOptional()
  connectWebsocket?: boolean;

  @ValidateNested()
  @Type(() => NetflixConfigDto)
  @IsOptional()
  netflix?: NetflixConfigDto;

  @IsNumber()
  @IsOptional()
  customer_status?: number;

  @IsString()
  @IsOptional()
  language?: string;
}
