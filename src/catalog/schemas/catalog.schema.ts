import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CatalogDocument = Catalog & Document;

// Schema para las pestañas de clasificación
const ClassifyTabSchema = new MongooseSchema({
  id: { type: Number, required: true },
  path: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  icon_selected: { type: String, required: true },
}, { _id: false });

// Schema para estadísticas
const StatisticsSchema = new MongooseSchema({
  memberNum: { type: Number, default: 0 },
  peopleNum: { type: Number, default: 0 },
  year: { type: Number, default: 0 },
}, { _id: false });

// Schema para órdenes recientes
const RecentOrderSchema = new MongooseSchema({
  out_trade_no: { type: String, required: true },
  user_name: { type: String, required: true },
  avatar_url: { type: String },
  create_time: { type: String, required: true },
  show_status: { type: Number, default: 2 },
  time: { type: String, required: true },
}, { _id: false });

// Schema para productos/servicios (SPU)
const SpuSchema = new MongooseSchema({
  id: { type: Number, required: true },
  type_name: { type: String, required: true },
  detail_route: { type: String, required: true },
  is_netflix: { type: Boolean, default: false },
  image: { type: String, required: true },
  image_type: { type: Number, default: 0 },
  thumb_img: { type: String },
  min_price: { type: String, required: true },
  currency_icon1: { type: String, default: '$' },
  currency_icon2: { type: String, default: 'USD($)' },
  currency_show_type: { type: Number, default: 1 },
  vip_status: { type: Number, default: 0 },
  lock_status: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  recent_order: { type: [RecentOrderSchema], default: [] },
  description: { type: [String], default: [] },
  prompt: { type: [String], default: [] },
}, { _id: false });

// Schema para categorías que contienen productos
const CategoryListSchema = new MongooseSchema({
  id: { type: Number, required: true },
  spuList: { type: [SpuSchema], default: [] },
}, { _id: false });

@Schema({ timestamps: true })
export class Catalog {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ type: [ClassifyTabSchema], required: true })
  classify_tab: Record<string, any>[];

  @Prop({ type: StatisticsSchema, required: true })
  statistics: Record<string, any>;

  @Prop({ type: [CategoryListSchema], required: true })
  list: Record<string, any>[];

  @Prop({ required: true, default: 'es' })
  language: string;

  @Prop({ default: null })
  promote: string;
}

export const CatalogSchema = SchemaFactory.createForClass(Catalog);
