import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true, unique: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  businessName: string;

  @Prop()
  subdomain: string;

  @Prop()
  customDomain: string;

  @Prop({ type: Object })
  settings: {
    theme: string;
    currency: string;
    language: string;
    paymentMethods: string[];
    shippingMethods: string[];
  };

  @Prop({ type: Object })
  branding: {
    logo: string;
    colors: {
      primary: string;
      secondary: string;
    };
    fonts: string;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  subscriptionPlan: string;

  @Prop()
  subscriptionExpiry: Date;

  @Prop({ type: Object })
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxUsers: number;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
