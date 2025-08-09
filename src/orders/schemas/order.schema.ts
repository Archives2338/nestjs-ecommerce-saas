import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

// Estados de las órdenes (fusionado de ambos schemas)
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected'
}

// Schema para items del pedido
@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop()
  duration?: string; // "1 mes", "3 meses"

  @Prop()
  profiles?: number; // Número de perfiles
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// Esquema para información de acceso del usuario (del UserOrder)
@Schema({ _id: false })
export class AccessCredentials {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  profile_pin?: string;
}

@Schema({ _id: false })
export class AccessInfo {
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

// Schema principal de Order - Fusionado con UserOrder
@Schema({ timestamps: true, collection: 'orders' })
export class Order extends Document {
  // CAMPOS BÁSICOS DEL CLIENTE
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer: Types.ObjectId;

  @Prop({ required: true })
  user_id: string; // ID del usuario (del UserOrder)

  // INFORMACIÓN DE LA ORDEN
  @Prop({ required: true, unique: true })
  out_trade_no: string; // Número único de orden (era order_number en UserOrder)

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  total: number;

  // INFORMACIÓN DEL SERVICIO
  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId;

  @Prop({ required: true })
  type_id: number; // ID del tipo de servicio (1=Netflix, 2=Disney+, etc.)

  @Prop({ required: true })
  type_plan_id: number; // ID específico del plan

  @Prop({ required: true })
  service_name: string; // "Netflix", "Spotify", etc.

  @Prop({ required: true })
  plan_name: string; // "6 meses Personal", etc.

  @Prop({ required: true })
  duration_months: number;

  @Prop({ required: true })
  max_users: number;

  // ESTADO Y FECHAS (fusionado)
  @Prop({ required: true, enum: OrderStatus, index: true })
  order_status: OrderStatus; // Estado principal de la orden

  @Prop({ required: true })
  starts_at: Date; // Inicio del servicio

  @Prop({ required: true, index: true })
  expires_at: Date; // Vencimiento del servicio

  // INFORMACIÓN DE ACCESO (del UserOrder)
  @Prop({ type: AccessInfo, required: false })
  access_info?: AccessInfo;

  // INFORMACIÓN DE PAGO (mejorada)
  @Prop({ type: PaymentInfo, required: false })
  payment_info?: PaymentInfo;

  // CAMPOS LEGACY (mantener para compatibilidad)

  @Prop({ required: false })
  product_id?: number;

  @Prop({ required: false })
  service_id?: number;

  @Prop({ default: 0 })
  substitute_recharge_id: number;

  @Prop({ required: true })
  number: number; // Cantidad

  @Prop({ required: true })
  screen: number; // Número de perfiles/pantallas

  @Prop({ required: true })
  payment_id: number; // 1=Yape, 2=Plin, 3=Transferencia

  // FECHAS DE SERVICIO
  @Prop()
  service_start_time?: string;

  @Prop()
  service_end_time?: string;

  // MONEDA Y PRECIOS
  @Prop({ default: 'PEN' })
  currency: string;

  @Prop({ default: 1 })
  otype: number;

  @Prop({ default: 0 })
  renew: number;

  @Prop({ default: 0 })
  renew_type: number;

  @Prop({ required: true })
  total_price: string; // String para mantener compatibilidad

  @Prop()
  original_price?: string;

  @Prop({ default: '0.00' })
  payment_fee: string;

  @Prop({ default: '0%' })
  payment_rate: string;

  // ESTADOS
  @Prop({ default: 1 })
  ostatus: number; // 1=pendiente, 2=pagado, 3=verificando, 5=cancelado

  @Prop({ default: 0 })
  refund_status: number;

  // DESCUENTOS
  @Prop({ default: '0.00' })
  coupon_discount: string;

  @Prop({ default: '0.00' })
  promo_code_discount: string;

  @Prop({ default: '0.00' })
  auto_renewal_discount: string;

  @Prop()
  promo_code?: string;

  // UBICACIÓN
  @Prop({ default: 'PE' })
  country_code: string;

  @Prop({ default: '' })
  username: string;

  // CAMPOS DE PAGO
  @Prop()
  comprobanteUrl?: string;

  @Prop()
  comprobanteOcrText?: string;

  @Prop()
  paymentMethod?: 'yape' | 'plin' | 'transferencia';

  @Prop()
  paymentReference?: string;

  @Prop()
  paymentAmount?: number;

  // CAMPOS DE VALIDACIÓN ADMINISTRATIVA
  @Prop()
  adminNotes?: string; // Notas del administrador

  @Prop()
  rejectionReason?: string; // Motivo de rechazo

  @Prop()
  validatedAt?: Date; // Fecha de validación

  @Prop()
  validatedBy?: string; // ID del admin que validó

  // TIMESTAMPS (agregados por { timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;

  // CAMPOS CALCULADOS PARA COMPATIBILIDAD
  get show_status(): number {
    return this.ostatus;
  }

  get actual_refund_status(): number {
    return this.refund_status;
  }

  get diff_price(): string {
    return '0.00';
  }

  get from_spu(): string {
    return '';
  }

  get substitute_recharge_status(): number {
    return -1;
  }

  get currency_icon1(): string {
    return this.currency === 'PEN' ? 'S/' : '$';
  }

  get currency_icon2(): string {
    return this.currency === 'PEN' ? 'PEN(S/)' : 'USD($)';
  }

  get create_time(): string {
    if (!this.createdAt) return '';
    
    const date = new Date(this.createdAt);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}

export const OrderSchema = SchemaFactory.createForClass(Order);
export const AccessCredentialsSchema = SchemaFactory.createForClass(AccessCredentials);
export const AccessInfoSchema = SchemaFactory.createForClass(AccessInfo);
export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);

// Índices para optimización (fusionado de ambos schemas)
OrderSchema.index({ user_id: 1, order_status: 1 });
OrderSchema.index({ out_trade_no: 1 }, { unique: true });
OrderSchema.index({ type_id: 1, order_status: 1 });
OrderSchema.index({ expires_at: 1, order_status: 1 });
OrderSchema.index({ 'access_info.account_id': 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customer: 1, order_status: 1 });
OrderSchema.index({ service: 1, order_status: 1 });
