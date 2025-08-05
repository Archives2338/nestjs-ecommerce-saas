import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto, AttachComprobanteDto } from './dto/create-order.dto';

interface MulterFile {
  buffer?: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly ocrService: OcrService
  ) {}

  /**
   * Crear nueva orden con todos los campos requeridos para el historial
   */
  async createOrder(createOrderDto: CreateOrderDto, customerId: string): Promise<Order> {
    try {
      console.log('�🚀 Creating order with data:', createOrderDto, 'for customer:', customerId);
      // Generar número único de orden
      const out_trade_no = this.generateOrderNumber();
      console.log('🔢 Generated order number:', out_trade_no);
      // Obtener información del servicio y plan (simplificado por ahora)
      const serviceInfo = await this.getServiceInfo(createOrderDto.serviceId, createOrderDto.type_plan_id);
      console.log('🔍 Service info:', serviceInfo);
      const orderData = { 
        // Campos básicos
        customer: new Types.ObjectId(customerId),
        items: createOrderDto.items,
        total: createOrderDto.total,
        
        // Campos para historial
        out_trade_no,
        service: new Types.ObjectId(createOrderDto.serviceId),
        type_id: serviceInfo.type_id,
        type_plan_id: createOrderDto.type_plan_id,
        number: createOrderDto.items.reduce((sum, item) => sum + item.quantity, 0),
        screen: createOrderDto.items[0]?.profiles || 1,
        payment_id: this.getPaymentMethodId(createOrderDto.paymentMethod),
        
        // Precios
        total_price: createOrderDto.total.toString(),
        original_price: serviceInfo.original_price,
        currency: 'PEN',
        
        // Estados iniciales
        ostatus: 1, // Pendiente
        
        // Otros campos
        paymentMethod: createOrderDto.paymentMethod,
        promo_code: createOrderDto.promo_code,
        country_code: 'PE'
      };

      const order = new this.orderModel(orderData);
      console.log('🔍 Order data:', orderData);
      const savedOrder = await order.save();
      
      this.logger.log(`Order created successfully: ${out_trade_no}`);
      return savedOrder;

    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de la orden
   */
  async updateOrderStatus(orderId: string, updateDto: UpdateOrderStatusDto): Promise<Order | null> {
    try {
      const statusMap = {
        'pendiente': 1,
        'pagado': 2,
        'completado': 2,
        'cancelado': 5,
        'verificacion_manual': 3
      };

      const order = await this.orderModel.findByIdAndUpdate(
        orderId, 
        { 
          ostatus: statusMap[updateDto.status] || 1,
          ...(updateDto.status === 'pagado' && {
            service_start_time: new Date().toLocaleDateString('es-PE'),
            service_end_time: this.calculateServiceEndDate(30) // 30 días por defecto
          })
        }, 
        { new: true }
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      this.logger.log(`Order ${orderId} status updated to: ${updateDto.status}`);
      return order;

    } catch (error) {
      this.logger.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Adjuntar comprobante con análisis OCR
   */
  async attachComprobante(orderId: string, file: MulterFile, attachDto: AttachComprobanteDto): Promise<Order | null> {
    try {
      let ocrText: string | undefined = undefined;
      
      if (file?.buffer) {
        // Procesar OCR
        ocrText = await this.ocrService.extractText(file.buffer);
        this.logger.log(`OCR processed for order ${orderId}`);
      }

      const updateData = {
        comprobanteUrl: attachDto.comprobanteUrl || `uploads/${orderId}_${Date.now()}.jpg`,
        comprobanteOcrText: ocrText,
        paymentReference: attachDto.paymentReference,
        paymentAmount: attachDto.paymentAmount,
        ostatus: 3 // Verificando comprobante
      };

      const order = await this.orderModel.findByIdAndUpdate(orderId, updateData, { new: true });
      
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      this.logger.log(`Comprobante attached to order ${orderId}`);
      return order;

    } catch (error) {
      this.logger.error('Error attaching comprobante:', error);
      throw error;
    }
  }

  /**
   * Buscar orden por ID
   */
  async findOrderById(orderId: string): Promise<Order | null> {
    return this.orderModel.findById(orderId).populate('service', 'name icon type_id');
  }

  /**
   * Buscar orden por número de orden
   */
  async findOrderByTradeNo(out_trade_no: string): Promise<Order | null> {
    return this.orderModel.findOne({ out_trade_no }).populate('service', 'name icon type_id');
  }

  /**
   * Listar órdenes por cliente con filtros (para historial)
   */
  async getOrderHistory(customerId: string, filters: any = {}, page: number = 1, limit: number = 10): Promise<{ orders: Order[], total: number }> {
    try {
      // Construir filtros
      const query: any = { customer: new Types.ObjectId(customerId) };
      
      if (filters.order_status) {
        const statusMap: Record<number, number> = {
          1: 1, // pendiente
          2: 2, // pagado
          3: 3, // verificando
          5: 5  // cancelado
        };
        query.ostatus = statusMap[filters.order_status as number];
      }
      
      if (filters.out_trade_no) {
        query.out_trade_no = { $regex: filters.out_trade_no, $options: 'i' };
      }
      
      if (filters.type_ids && filters.type_ids.length > 0) {
        query.type_id = { $in: filters.type_ids };
      }
      
      if (filters.start_time && filters.end_time) {
        query.createdAt = {
          $gte: new Date(filters.start_time),
          $lte: new Date(filters.end_time)
        };
      }

      // Ejecutar consulta con paginación
      const [orders, total] = await Promise.all([
        this.orderModel
          .find(query)
          .populate('service', 'name icon type_id')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        this.orderModel.countDocuments(query)
      ]);

      return { orders, total };

    } catch (error) {
      this.logger.error('Error getting order history:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de órdenes por estado
   */
  async getOrderStatistics(customerId: string): Promise<any[]> {
    try {
      const stats = await this.orderModel.aggregate([
        { $match: { customer: new Types.ObjectId(customerId) } },
        {
          $group: {
            _id: '$ostatus',
            count: { $sum: 1 }
          }
        }
      ]);

      // Formatear para el mock
      const formattedStats = [1, 2, 3, 4, 5].map(status => ({
        order_status: status,
        count: stats.find(s => s._id === status)?.count || 0
      }));

      return formattedStats;

    } catch (error) {
      this.logger.error('Error getting order statistics:', error);
      throw error;
    }
  }

  /**
   * Obtener tipos de servicios del usuario
   */
  async getUserServiceTypes(customerId: string): Promise<any[]> {
    try {
      const serviceTypes = await this.orderModel.aggregate([
        { $match: { customer: new Types.ObjectId(customerId) } },
        {
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'serviceInfo'
          }
        },
        { $unwind: '$serviceInfo' },
        {
          $group: {
            _id: '$type_id',
            type_name: { $first: '$serviceInfo.name' }
          }
        }
      ]);

      return serviceTypes.map(st => ({
        type_id: st._id,
        type_name: st.type_name
      }));

    } catch (error) {
      this.logger.error('Error getting user service types:', error);
      return [];
    }
  }

  // MÉTODOS PRIVADOS

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return timestamp.slice(-10) + random; // 14 dígitos
  }

  private getPaymentMethodId(method: string): number {
    const methodMap: Record<string, number> = {
      'yape': 1,
      'plin': 2,
      'transferencia': 3
    };
    return methodMap[method.toLowerCase()] || 1;
  }

  private async getServiceInfo(serviceId: string, typePlanId: number): Promise<any> {
    // TODO: Integrar con ServicesService para obtener info real
    // Por ahora retorno datos mock
    return {
      type_id: 1, // Netflix por defecto
      original_price: '21.99'
    };
  }

  private calculateServiceEndDate(days: number): string {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return endDate.toLocaleDateString('es-PE');
  }
  
  /**
   * Asignar información de acceso a una orden
   */
  async assignAccessToOrder(orderNumber: string, accessInfo: any): Promise<Order | null> {
    try {
      const order = await this.orderModel.findOneAndUpdate(
        { out_trade_no: orderNumber },
        { 
          access_info: accessInfo,
          order_status: 'active',
          ostatus: 2 // Pagado/Activo
        },
        { new: true }
      );

      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      this.logger.log(`Access assigned to order ${orderNumber}`);
      return order;

    } catch (error) {
      this.logger.error('Error assigning access to order:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes activas de un usuario
   */
  async getActiveUserOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await this.orderModel
        .find({
          user_id: userId,
          order_status: 'active',
          expires_at: { $gt: new Date() }
        })
        .populate('service', 'name icon')
        .sort({ createdAt: -1 })
        .exec();

      return orders;

    } catch (error) {
      this.logger.error('Error getting active user orders:', error);
      return [];
    }
  }

  /**
   * Verificar y expirar órdenes vencidas
   */
  async expireOverdueOrders(): Promise<void> {
    try {
      const expiredOrders = await this.orderModel.updateMany(
        {
          order_status: 'active',
          expires_at: { $lt: new Date() }
        },
        {
          order_status: 'expired',
          ostatus: 4 // Expirado
        }
      );

      this.logger.log(`Expired ${expiredOrders.modifiedCount} overdue orders`);

    } catch (error) {
      this.logger.error('Error expiring overdue orders:', error);
    }
  }
}
