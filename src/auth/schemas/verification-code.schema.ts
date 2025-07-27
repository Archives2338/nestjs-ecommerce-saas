import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VerificationCodeDocument = VerificationCode & Document;

@Schema({ 
  timestamps: true,
  collection: 'verification_codes'
})
export class VerificationCode {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  type: string; // 'registration', 'login', 'password_reset'

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ required: false })
  ipAddress?: string;

  @Prop({ required: false })
  userAgent?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode);

// Index para auto-eliminación de códigos expirados
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
