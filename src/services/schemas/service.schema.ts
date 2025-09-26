import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document & {
  _id: Types.ObjectId;
};

// Esquema para los planes de precios individuales
@Schema({ _id: false })
export class PlanItem {
  @Prop({ required: true })
  month_id: number;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  month_content: string;

  @Prop({ required: true })
  screen_id: number;

  @Prop({ required: true })
  max_user: number;

  @Prop({ required: true })
  substitute_recharge: number;

  @Prop({ required: true })
  screen: number;

  @Prop({ required: true })
  screen_content: string;

  @Prop({ required: true })
  seat_type: string;

  @Prop({ required: true })
  type_plan_id: number;

  @Prop({ required: false, default: 0 }) // 🔧 Cambiado a opcional con default
  sort: number;

  @Prop({ required: false, default: '$' }) // 🔧 Cambiado a opcional con default
  currency_icon1: string;

  @Prop({ required: false, default: 'USD($)' }) // 🔧 Cambiado a opcional con default
  currency_icon2: string;

  @Prop({ required: false, default: 1 }) // 🔧 Cambiado a opcional con default
  currency_show_type: number;

  @Prop({ required: true })
  original_price: string;

  @Prop({ required: true })
  sale_price: string;

  @Prop({ required: true })
  average_price: string;

  @Prop({ required: false, default: '0' }) // 🔧 Cambiado a opcional con default
  discount: string;
}

export const PlanItemSchema = SchemaFactory.createForClass(PlanItem);

// Esquema para opciones de pantalla
@Schema({ _id: false })
export class ScreenOption {
  @Prop({ required: true })
  screen_id: number;

  @Prop({ required: true })
  max_user: number;

  @Prop({ required: true })
  substitute_recharge: number;

  @Prop({ required: true })
  screen: number;

  @Prop({ required: true })
  screen_content: string;

  @Prop({ required: true })
  seat_type: string;

  @Prop({ required: false, default: 0 }) // 🔧 Cambiado a opcional con default
  sort: number;

  @Prop({ type: [PlanItemSchema], default: [] })
  month: PlanItem[];
}

export const ScreenOptionSchema = SchemaFactory.createForClass(ScreenOption);

// Esquema para meses
@Schema({ _id: false })
export class MonthOption {
  @Prop({ required: true })
  month_id: number;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  month_content: string;

  @Prop({ type: [PlanItemSchema], default: [] })
  screen: PlanItem[];
}

export const MonthOptionSchema = SchemaFactory.createForClass(MonthOption);

// Esquema para planes (plan y repayment)
@Schema({ _id: false })
export class ServicePlans {
  @Prop({ type: [MonthOptionSchema], default: [] })
  month: MonthOption[];

  @Prop({ type: [ScreenOptionSchema], default: [] })
  screen: ScreenOption[];

  @Prop({ required: false })
  default_month_id?: number;

  @Prop({ required: false })
  default_screen_id?: number;
}

export const ServicePlansSchema = SchemaFactory.createForClass(ServicePlans);

// Esquema principal del servicio
@Schema({ 
  timestamps: true,
  collection: 'services'
})
export class Service {
  @Prop({ required: true, index: true })
  type_id: number;

  @Prop({ required: true, index: true })
  language: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  subtitle: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  type: number;

  @Prop({ required: false })
  url?: string;

  @Prop({ required: false })
  privacy_url?: string;

  @Prop({ required: false })
  term_url?: string;

  @Prop({ required: false })
  refund_url?: string;

  @Prop({ required: false })
  promotion_url?: string;

  @Prop({ type: ServicePlansSchema, required: true })
  plan: ServicePlans;

  @Prop({ type: ServicePlansSchema, required: true })
  repayment: ServicePlans;

  @Prop({ required: false, default: 0 }) // 🔧 Agregado default
  sort?: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Índices adicionales
ServiceSchema.index({ type_id: 1, language: 1 }, { unique: true });
ServiceSchema.index({ active: 1 });
ServiceSchema.index({ sort: 1 });