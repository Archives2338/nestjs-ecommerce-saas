import { Injectable } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly ocrService: OcrService
  ) {}

  async createOrder(data: Partial<Order>): Promise<Order> {
    const order = new this.orderModel(data);
    return order.save();
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  }

  /**
   * Adjunta comprobante y procesa OCR si se provee el buffer de imagen
   */
  async attachComprobante(orderId: string, comprobanteUrl: string, imageBuffer?: Buffer): Promise<Order | null> {
    let ocrText: string | undefined = undefined;
    if (imageBuffer) {
      ocrText = await this.ocrService.extractText(imageBuffer);
    }
    return this.orderModel.findByIdAndUpdate(orderId, { comprobanteUrl, comprobanteOcrText: ocrText, status: 'comprobante recibido' }, { new: true });
  }

  async findOrderById(orderId: string): Promise<Order | null> {
    return this.orderModel.findById(orderId);
  }

  async listOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.orderModel.find({ customer: customerId }).sort({ createdAt: -1 });
  }
}
