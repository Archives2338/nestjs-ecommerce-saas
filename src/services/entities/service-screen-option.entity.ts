import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceScreenOptionDocument = ServiceScreenOption & Document & {
  _id: Types.ObjectId;
};

@Schema({ 
  collection: 'service_screen_options',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class ServiceScreenOption {
  @Prop({ required: true })
  screen_id: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

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

  @Prop({ default: 0 })
  sort: number;

  @Prop({ default: false })
  is_default: boolean;

  @Prop({ default: true })
  active: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const ServiceScreenOptionSchema = SchemaFactory.createForClass(ServiceScreenOption);

// Índice único para evitar duplicados
ServiceScreenOptionSchema.index({ serviceId: 1, screen: 1 }, { unique: true });
