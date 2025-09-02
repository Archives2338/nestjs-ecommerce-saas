import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServicePlanDocument = ServicePlan & Document & {
  _id: Types.ObjectId;
};

@Schema({ 
  collection: 'service_plans',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class ServicePlan {
  @Prop({ required: true })
  type_plan_id: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  month_id: number;

  @Prop({ required: true })
  screen_id: number;

  @Prop({ 
    required: true,
    enum: ['plan', 'repayment'],
    default: 'plan'
  })
  plan_type: 'plan' | 'repayment';

  // Pricing Information
  @Prop({ default: '$' })
  currency_icon1: string;

  @Prop({ default: 'USD' })
  currency_icon2: string;

  @Prop({ default: 1 })
  currency_show_type: number;

  @Prop({ required: true, type: Number })
  original_price: number;

  @Prop({ required: true, type: Number })
  sale_price: number;

  @Prop({ required: true, type: Number })
  average_price: number;

  @Prop({ default: '0%' })
  discount: string;

  @Prop({ default: 0 })
  sort: number;

  @Prop({ default: true })
  active: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const ServicePlanSchema = SchemaFactory.createForClass(ServicePlan);

// Índice único para evitar duplicados de combinación mes + pantalla + tipo de plan
ServicePlanSchema.index({ 
  serviceId: 1, 
  month_id: 1, 
  screen_id: 1, 
  plan_type: 1 
}, { unique: true });
