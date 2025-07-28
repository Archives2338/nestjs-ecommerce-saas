import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserOrderDocument = UserOrder & Document & {
  _id: Types.ObjectId;
};

// Estados de las órdenes
export enum OrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

// Esquema para información de la compra
@Schema({ _id: false })
export class PurchaseInfo {
  @Prop({ required: true })
  service_id: number;

  @Prop({ required: true })
  service_name: string;

  @Prop({ required: true })
  plan_id: number; // type_plan_id del servicio

  @Prop({ required: true })
  plan_name: string; // "6 meses Personal", etc.

  @Prop({ required: true })
  duration_months: number;

  @Prop({ required: true })
  max_users: number;

  @Prop({ required: true })
  original_price: string;

  @Prop({ required: true })
  paid_price: string;

  @Prop({ required: true })
  currency: string;
}

// Esquema para información de pago
@Schema({ _id: false })
export class PaymentInfo {
  @Prop({ required: true })
  transaction_id: string;

  @Prop({ required: true })
  payment_method: string;

  @Prop({ required: true })
  paid_at: Date;
}

// Esquema para credenciales de acceso
@Schema({ _id: false })
export class AccessCredentials {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  profile_pin?: string;
}

// Esquema para información de acceso del usuario
@Schema({ _id: false })
export class UserAccess {
  @Prop({ required: true })
  account_id: Types.ObjectId; // Referencia a la cuenta asignada

  @Prop({ required: false })
  profile_name?: string; // Nombre del perfil asignado

  @Prop({ required: false })
  slot_number?: number; // Número de slot asignado

  @Prop({ type: AccessCredentials, required: false })
  access_credentials?: AccessCredentials;

  @Prop({ required: false })
  last_access?: Date;
}

// Esquema principal de órdenes de usuario
@Schema({ 
  timestamps: true,
  collection: 'user_orders'
})
export class UserOrder {
  @Prop({ required: true, index: true })
  user_id: string; // ID del usuario que compró

  @Prop({ required: true, index: true })
  order_number: string; // Número único de orden

  @Prop({ required: true, enum: OrderStatus, index: true })
  status: OrderStatus;

  @Prop({ type: PurchaseInfo, required: true })
  purchase_info: PurchaseInfo;

  @Prop({ type: UserAccess, required: false })
  access_info?: UserAccess;

  @Prop({ required: true })
  starts_at: Date;

  @Prop({ required: true, index: true })
  expires_at: Date;

  @Prop({ type: PaymentInfo, required: false })
  payment_info?: PaymentInfo;

  @Prop({ required: false })
  notes?: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const UserOrderSchema = SchemaFactory.createForClass(UserOrder);
export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);
export const AccessCredentialsSchema = SchemaFactory.createForClass(AccessCredentials);
export const UserAccessSchema = SchemaFactory.createForClass(UserAccess);
export const PurchaseInfoSchema = SchemaFactory.createForClass(PurchaseInfo);

// Índices para optimización
UserOrderSchema.index({ user_id: 1, status: 1 });
UserOrderSchema.index({ order_number: 1 }, { unique: true });
UserOrderSchema.index({ 'purchase_info.service_id': 1, status: 1 });
UserOrderSchema.index({ expires_at: 1, status: 1 });
UserOrderSchema.index({ 'access_info.account_id': 1 });
UserOrderSchema.index({ created_at: -1 });
