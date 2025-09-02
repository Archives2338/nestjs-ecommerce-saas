import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceMonthOptionDocument = ServiceMonthOption & Document & {
  _id: Types.ObjectId;
};

@Schema({ 
  collection: 'service_month_options',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class ServiceMonthOption {
  @Prop({ required: true })
  month_id: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  month_content: string;

  @Prop({ default: 0 })
  sort: number;

  @Prop({ default: false })
  is_default: boolean;

  @Prop({ default: true })
  active: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const ServiceMonthOptionSchema = SchemaFactory.createForClass(ServiceMonthOption);

// Índice único para evitar duplicados
ServiceMonthOptionSchema.index({ serviceId: 1, month: 1 }, { unique: true });
