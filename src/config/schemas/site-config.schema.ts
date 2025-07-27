import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SiteConfigDocument = SiteConfig & Document;

const NavigationItemSchema = new MongooseSchema({
  name: { type: String, required: true },
  key_word: { type: String, required: true },
  target_blank: { type: Number, default: 0 },
  link_url: { type: String, required: true },
}, { _id: false });

const LogoConfigSchema = new MongooseSchema({
  url: { type: String, required: true },
  type: { type: Number, default: 0 },
  not_theme_url: { type: String },
  not_theme_type: { type: Number, default: 0 },
  origin_type: { type: Number, default: 0 },
}, { _id: false });

const UserCenterMenuItemSchema = new MongooseSchema({
  name: { type: String, required: true },
  key_word: { type: String, required: true },
  link_url: { type: String, default: '' },
  link_rule: { type: Number, default: 0 },
  is_block: { type: Number, default: 0 },
  default_icon: { type: String, required: true },
  selected_icon: { type: String, required: true },
}, { _id: false });

const NetflixConfigSchema = new MongooseSchema({
  crisp_switch: { type: Number, default: 1 },
  get_code: { type: Number, default: 0 },
  appease_status: { type: Number, default: 0 },
  affiliate_term: { type: Number, default: 1 },
  netflix_change: { type: Number, default: 0 },
  order_rank_rate: { type: Number, default: 20 },
  user_country_status: { type: Number, default: 0 },
  netflix_suspends_top: { type: Number, default: 0 },
  netflix_suspends_middle: { type: Number, default: 0 },
  spotify_fault_apply_status: { type: Number, default: 1 },
  netflix_fault_apply_status: { type: Number, default: 1 },
  spotify_service_guide_refund_credit: { type: Number, default: 1 },
  netflix_service_guide_refund_credit: { type: Number, default: 1 },
  netflix_vpn_check: { type: Number, default: 1 },
  supply_update_status: { type: Number, default: 0 },
  supply_update_time: { type: Date },
  gamsai_divert_switch: { type: Number, default: 1 },
  change_plan_style: { type: Number, default: 1 },
}, { _id: false });

@Schema({ timestamps: true })
export class SiteConfig {
  @Prop({ default: 0 })
  trustpilot_footer: number;

  @Prop({ default: 0 })
  trustpilot_affiliate: number;

  @Prop({ default: 1 })
  help_center: number;

  @Prop({ default: 0 })
  questionnaire: number;

  @Prop({ default: 0 })
  gosplit_guide: number;

  @Prop({ default: 0 })
  gosplit_guide_sku_detail: number;

  @Prop({ default: 0 })
  gosplit_guide_pay_result: number;

  @Prop({ default: 1 })
  gosplit_guide_lock_alter: number;

  @Prop({ required: true })
  subject_information: string;

  @Prop({ default: '' })
  index_top_tips: string;

  @Prop({ default: 0 })
  crisp_login_switch: number;

  @Prop({ default: 1 })
  crisp_not_login_switch: number;

  @Prop({ default: 1 })
  cookie_pop_up: number;

  @Prop({ type: LogoConfigSchema })
  head_logo_b: Record<string, any>;

  @Prop({ default: 18 })
  crisp_flow_id: number;

  @Prop({ type: [NavigationItemSchema] })
  navigation: Record<string, any>[];

  @Prop({ type: [NavigationItemSchema] })
  navigation_footer: Record<string, any>[];

  @Prop({ type: [UserCenterMenuItemSchema] })
  user_center_menu: Record<string, any>[];

  @Prop({ default: false })
  show_year_review: boolean;

  @Prop({ default: 0 })
  youtubeNum: number;

  @Prop({ default: 0 })
  netflixNum: number;

  @Prop({ default: false })
  connectWebsocket: boolean;

  @Prop({ type: NetflixConfigSchema })
  netflix: Record<string, any>;

  @Prop({ default: 0 })
  customer_status: number;

  @Prop({ required: true, default: 'es' })
  language: string;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);
