import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerificationCodeDocument = VerificationCode & Document;

@Schema({ 
  timestamps: true,
  collection: 'verification_codes'
})
export class VerificationCode {
  @Prop({ 
    required: true, 
    index: true 
  })
  email: string;

  @Prop({ 
    required: true,
    length: 6
  })
  code: string;

  @Prop({ 
    required: true,
    enum: ['email_verification', 'password_reset', 'registration'],
    default: 'registration'
  })
  type: string;

  @Prop({ 
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
  })
  expiresAt: Date;

  @Prop({ 
    default: false 
  })
  used: boolean;

  @Prop({ 
    default: 0,
    max: 5 // Máximo 5 intentos
  })
  attempts: number;

  @Prop()
  usedAt?: Date;

  @Prop()
  ipAddress?: string;
}

export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode);

// Índices para optimización
VerificationCodeSchema.index({ email: 1, type: 1 });
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
VerificationCodeSchema.index({ code: 1, email: 1 });
