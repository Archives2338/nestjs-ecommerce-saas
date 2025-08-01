import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer: Types.ObjectId;

  @Prop({ required: true })
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'pendiente de pago', enum: ['pendiente de pago', 'comprobante recibido', 'validando comprobante', 'pagado', 'rechazado'] })
  status: string;

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
}

export const OrderSchema = SchemaFactory.createForClass(Order);
