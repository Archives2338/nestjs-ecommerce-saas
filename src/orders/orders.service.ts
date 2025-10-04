import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { S3Service } from '../files/s3.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { CreateOrderDto, UpdateOrderStatusDto, AttachComprobanteDto } from './dto/create-order.dto';

// Tipo para archivos Multer
interface MulterFile {
  buffer?: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname?: string;
  encoding?: string;
  stream?: any;
  destination?: string;
  filename?: string;
  path?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private readonly ocrService: OcrService,
    private readonly s3Service: S3Service
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
        user_id: customerId, // ✅ Agregar user_id obligatorio
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
        
        // ✅ Campos obligatorios que faltaban
        service_name: serviceInfo.service_name || 'Unknown Service',
        plan_name: `${createOrderDto.items[0]?.name || serviceInfo.plan_details?.screen_content || 'Plan 1 mes'}`,
        duration_months: serviceInfo.plan_details?.month || 1,
        max_users: serviceInfo.plan_details?.max_user || createOrderDto.items[0]?.profiles || 1,
        order_status: OrderStatus.PENDING, // Estado inicial
        starts_at: new Date(), // Fecha de inicio
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
        
        // Precios
        total_price: createOrderDto.total.toString(),
        original_price: serviceInfo.original_price || '0.00',
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
          order_status: updateDto.status === 'pagado' ? 'active' : updateDto.status === 'cancelado' ? 'canceled' : 'pending',
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
   * Adjuntar comprobante subiendo a AWS S3 (MVP sin OCR)
   */
  async attachComprobante(orderId: string, file: MulterFile, attachDto: AttachComprobanteDto): Promise<Order | null> {
    try {
      console.log('🔍 Attaching comprobante to order:', orderId, 'with file:', file.originalname);
      let comprobanteUrl = '';
      
      if (file?.buffer) {
        // 📁 Subir archivo a AWS S3 en carpeta 'comprobantes'
        this.logger.log(`Uploading comprobante to S3 for order ${orderId}`);
        
        // Crear objeto compatible con Express.Multer.File
        const multerFile: Express.Multer.File = {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          fieldname: file.fieldname || 'comprobante',
          encoding: file.encoding || '7bit',
          stream: file.stream || null,
          destination: file.destination || '',
          filename: file.filename || file.originalname,
          path: file.path || ''
        };
        
        const uploadResult = await this.s3Service.uploadFile(multerFile, 'comprobantes');
        
        if (uploadResult.success && uploadResult.url) {
          comprobanteUrl = uploadResult.url;
          this.logger.log(`Comprobante uploaded to S3: ${comprobanteUrl}`);
        } else {
          this.logger.error(`Failed to upload comprobante to S3: ${uploadResult.error}`);
          throw new Error('Error subiendo comprobante a S3');
        }
      }

      const updateData = {
        comprobanteUrl: comprobanteUrl || attachDto.comprobanteUrl || `uploads/${orderId}_${Date.now()}.jpg`,
        comprobanteOcrText: 'pronto validaremos', // 🔧 MVP: Texto hardcodeado en lugar de OCR
        paymentReference: attachDto.paymentReference,
        paymentAmount: attachDto.paymentAmount,
        ostatus: 3 // Verificando comprobante
      };

      const order = await this.orderModel.findByIdAndUpdate(orderId, updateData, { new: true });
      
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      this.logger.log(`Comprobante attached to order ${orderId} with S3 URL: ${comprobanteUrl}`);
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
    try {
      // Consultar el servicio por ID
      const service = await this.serviceModel.findById(serviceId).exec();
      
      if (!service) {
        this.logger.warn(`Service not found with ID: ${serviceId}, using defaults`);
        return {
          type_id: 1, // Netflix por defecto
          original_price: '21.99',
          service_name: 'Unknown Service'
        };
      }

      // Buscar el plan específico en la estructura de pantallas
      let planInfo = null;
      
      // Buscar en plan.month[].screen[]
      if (service.plan && service.plan.month) {
        for (const monthPlan of service.plan.month) {
          if (monthPlan.screen) {
            planInfo = monthPlan.screen.find(screen => screen.type_plan_id === typePlanId);
            if (planInfo) break;
          }
        }
      }

      // Si no se encuentra en month, buscar en plan.screen[].month[]
      if (!planInfo && service.plan && service.plan.screen) {
        for (const screenPlan of service.plan.screen) {
          if (screenPlan.month) {
            planInfo = screenPlan.month.find(month => month.type_plan_id === typePlanId);
            if (planInfo) break;
          }
        }
      }

      if (!planInfo) {
        this.logger.warn(`Plan not found with type_plan_id: ${typePlanId} in service: ${serviceId}`);
        return {
          type_id: service.type_id || 1,
          original_price: '21.99',
          service_name: service.name || 'Unknown Service'
        };
      }

      // Retornar información completa del servicio y plan
      return {
        type_id: service.type_id,
        service_name: service.name,
        original_price: planInfo.original_price || planInfo.sale_price || '0.00',
        sale_price: planInfo.sale_price || planInfo.original_price || '0.00',
        plan_details: {
          type_plan_id: planInfo.type_plan_id,
          month: planInfo.month,
          month_content: planInfo.month_content,
          screen: planInfo.screen,
          screen_content: planInfo.screen_content,
          max_user: planInfo.max_user,
          seat_type: planInfo.seat_type
        }
      };
      
    } catch (error) {
      this.logger.error('Error getting service info:', error);
      return {
        type_id: 1,
        original_price: '21.99',
        service_name: 'Error Service'
      };
    }
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
