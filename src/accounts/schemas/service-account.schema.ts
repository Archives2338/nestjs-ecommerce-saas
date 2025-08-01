import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ServiceAccount extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;

  @Prop({
    type: [
      {
        profileId: { type: String, required: true },
        status: { type: String, enum: ['disponible', 'vendido', 'reservado'], default: 'disponible' },
        assignedTo: { type: Types.ObjectId, ref: 'Customer', default: null },
        expiresAt: { type: Date, default: null }
      }
    ],
    default: []
  })
  profiles: {
    profileId: string;
    status: 'disponible' | 'vendido' | 'reservado';
    assignedTo?: Types.ObjectId;
    expiresAt?: Date;
  }[];
}

export const ServiceAccountSchema = SchemaFactory.createForClass(ServiceAccount);
