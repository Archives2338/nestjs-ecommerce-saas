import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ collection: 'customers', timestamps: true })
export class Customer {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false }) // Optional para OAuth users
  password?: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ required: false })
  emailVerificationToken?: string;

  @Prop({ required: false })
  passwordResetToken?: string;

  @Prop({ required: false })
  passwordResetExpires?: Date;

  // OAuth Fields (preparado para Google/Facebook)
  @Prop({ 
    type: [{
      provider: { type: String, enum: ['google', 'facebook', 'local'] },
      providerId: String,
      email: String,
      displayName: String,
      profilePicture: String
    }],
    default: []
  })
  oAuthProviders: Array<{
    provider: 'google' | 'facebook' | 'local';
    providerId: string;
    email: string;
    displayName?: string;
    profilePicture?: string;
  }>;

  // Información de compras y pedidos
  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: new Date() })
  lastLoginAt: Date;

  @Prop({ required: false })
  lastLoginIP?: string;

  // Preferencias del cliente
  @Prop({ default: 'es' })
  preferredLanguage: string;

  @Prop({ default: 'USD' })
  preferredCurrency: string;

  // Direcciones (para futuras compras físicas)
  @Prop({
    type: [{
      type: { type: String, enum: ['billing', 'shipping'] },
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      isDefault: { type: Boolean, default: false }
    }],
    default: []
  })
  addresses: Array<{
    type: 'billing' | 'shipping';
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
  }>;

  // Metadatos adicionales
  @Prop({
    type: Object,
    default: {}
  })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Índices para optimización
CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ 'oAuthProviders.provider': 1, 'oAuthProviders.providerId': 1 });
CustomerSchema.index({ emailVerificationToken: 1 });
CustomerSchema.index({ passwordResetToken: 1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ isActive: 1 });
