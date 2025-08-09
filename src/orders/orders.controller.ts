import { Controller, Post, Get, Put, Body, Param, Req, UploadedFile, UseInterceptors, HttpStatus, HttpCode, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto, AttachComprobanteDto } from './dto/create-order.dto';
import { CustomerJwtAuthGuard } from './customer-jwt-auth.guard';
import { CurrentUser, UserId } from '../common/decorators/user.decorator';

interface MulterFile {
  buffer?: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Controller('api/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ocrService: OcrService
  ) {}

  /**
   * API de prueba para cargar imagen y extraer texto OCR
   * POST /api/orders/test-ocr
   */
  @Post('test-ocr')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async testOcr(@UploadedFile() file: { buffer: Buffer }) {
    if (!file) {
      return { code: 1, message: 'No se recibió archivo', data: null };
    }
    const text = await this.ocrService.extractText(file.buffer);
    return {
      code: 0,
      message: 'Texto extraído',
      data: { text }
    };
  }

  // ================================
  // ENDPOINTS CON AUTENTICACIÓN JWT
  // ================================

  /**
   * Crear nueva orden - REQUIERE AUTENTICACIÓN
   * POST /api/orders
   */
  @Post()
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto, 
    @UserId() userId: string,
    @CurrentUser() user: any
  ) {
    console.log('� DEBUG - Raw user object:', JSON.stringify(user, null, 2));
    console.log('🔍 DEBUG - Extracted userId:', userId);
    console.log('�🚀 Creating order for user:', userId, 'with data:', createOrderDto);
    // Verificar que el usuario está autenticado
    if (!userId) {
      console.log('❌ DEBUG - No userId found!');
      return {
        code: 1,
        message: 'Usuario no autenticado',
        data: null
      };
    }

    const order = await this.ordersService.createOrder(createOrderDto, userId);
    return {
      code: 0,
      message: 'Orden creada exitosamente',
      data: order
    };
  }

  /**
   * Adjuntar comprobante de pago con archivo - REQUIERE AUTENTICACIÓN
   * PUT /api/orders/:id/comprobante
   */
  @Put(':id/comprobante')
  @UseGuards(CustomerJwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async attachComprobante(
    @Param('id') orderId: string, 
    @UploadedFile() file: MulterFile,
    @Body() attachDto: AttachComprobanteDto,
    @UserId() userId: string
  ) {
    console.log('🔍 DEBUG - Raw body data:', JSON.stringify(attachDto, null, 2));
    console.log('🔍 DEBUG - paymentAmount type:', typeof attachDto.paymentAmount, 'value:', attachDto.paymentAmount);
    console.log('🔍 Attaching comprobante to order:', orderId, 'with file:', file?.originalname);
    
    // Verificar que la orden pertenece al usuario autenticado
    const existingOrder = await this.ordersService.findOrderById(orderId);
    if (!existingOrder || existingOrder.customer.toString() !== userId) {
      return {
        code: 1,
        message: 'Orden no encontrada o no autorizada',
        data: null
      };
    }

    const order = await this.ordersService.attachComprobante(orderId, file, attachDto);
    return {
      code: order ? 0 : 1,
      message: order ? 'Comprobante adjuntado exitosamente' : 'Error al adjuntar comprobante',
      data: order
    };
  }

  /**
   * Obtener orden por ID - REQUIERE AUTENTICACIÓN
   * GET /api/orders/:id
   */
  @Get(':id')
  @UseGuards(CustomerJwtAuthGuard)
  async getOrder(@Param('id') orderId: string, @UserId() userId: string) {
    const order = await this.ordersService.findOrderById(orderId);
    
    // Verificar que la orden pertenece al usuario autenticado
    if (!order || order.customer.toString() !== userId) {
      return {
        code: 1,
        message: 'Orden no encontrada o no autorizada',
        data: null
      };
    }

    return {
      code: 0,
      message: 'Orden encontrada',
      data: order
    };
  }

  /**
   * Obtener historial de órdenes del usuario autenticado
   * GET /api/orders/my/history
   */
  @Get('my/history')
  @UseGuards(CustomerJwtAuthGuard)
  async getMyOrderHistory(
    @UserId() userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('order_status') order_status?: number,
    @Query('out_trade_no') out_trade_no?: string,
    @Query('type_ids') type_ids?: string,
    @Query('start_time') start_time?: string,
    @Query('end_time') end_time?: string
  ) {
    const filters = {
      order_status,
      out_trade_no,
      type_ids: type_ids ? type_ids.split(',').map(Number) : undefined,
      start_time,
      end_time
    };

    const result = await this.ordersService.getOrderHistory(userId, filters, page, limit);
    
    return {
      code: 0,
      message: 'Historial obtenido exitosamente',
      data: {
        orders: result.orders,
        pagination: {
          current_page: page,
          per_page: limit,
          total: result.total,
          total_pages: Math.ceil(result.total / limit)
        }
      }
    };
  }

  /**
   * Obtener estadísticas de órdenes del usuario autenticado
   * GET /api/orders/my/statistics
   */
  @Get('my/statistics')
  @UseGuards(CustomerJwtAuthGuard)
  async getMyOrderStatistics(@UserId() userId: string) {
    const stats = await this.ordersService.getOrderStatistics(userId);
    return {
      code: 0,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    };
  }

  // ================================
  // ENDPOINTS ADMINISTRATIVOS
  // ================================

  /**
   * [ADMIN] Actualizar estado de la orden
   * PUT /api/orders/:id/status
   */
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(@Param('id') orderId: string, @Body() updateDto: UpdateOrderStatusDto) {
    const order = await this.ordersService.updateOrderStatus(orderId, updateDto);
    return {
      code: order ? 0 : 1,
      message: order ? 'Estado actualizado exitosamente' : 'Orden no encontrada',
      data: order
    };
  }

  /**
   * [ADMIN] Buscar orden por número de orden
   * GET /api/orders/trade-no/:tradeNo
   */
  @Get('trade-no/:tradeNo')
  async getOrderByTradeNo(@Param('tradeNo') tradeNo: string) {
    const order = await this.ordersService.findOrderByTradeNo(tradeNo);
    return {
      code: order ? 0 : 1,
      message: order ? 'Orden encontrada' : 'Orden no encontrada',
      data: order
    };
  }

  /**
   * [ADMIN] Obtener historial de órdenes de un cliente específico
   * GET /api/orders/customer/:customerId/history
   */
  @Get('customer/:customerId/history')
  async getOrderHistory(
    @Param('customerId') customerId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('order_status') order_status?: number,
    @Query('out_trade_no') out_trade_no?: string,
    @Query('type_ids') type_ids?: string,
    @Query('start_time') start_time?: string,
    @Query('end_time') end_time?: string
  ) {
    const filters = {
      order_status,
      out_trade_no,
      type_ids: type_ids ? type_ids.split(',').map(Number) : undefined,
      start_time,
      end_time
    };

    const result = await this.ordersService.getOrderHistory(customerId, filters, page, limit);
    
    return {
      code: 0,
      message: 'Historial obtenido exitosamente',
      data: {
        orders: result.orders,
        pagination: {
          current_page: page,
          per_page: limit,
          total: result.total,
          total_pages: Math.ceil(result.total / limit)
        }
      }
    };
  }

  /**
   * [ADMIN] Obtener tipos de servicios del usuario
   * GET /api/orders/customer/:customerId/service-types
   */
  @Get('customer/:customerId/service-types')
  async getUserServiceTypes(@Param('customerId') customerId: string) {
    const serviceTypes = await this.ordersService.getUserServiceTypes(customerId);
    return {
      code: 0,
      message: 'Tipos de servicios obtenidos exitosamente',
      data: serviceTypes
    };
  }

  /**
   * [ADMIN] Listar todas las órdenes de un cliente (método simple para compatibilidad)
   * GET /api/orders/customer/:customerId
   */
  @Get('customer/:customerId')
  async listOrdersByCustomer(@Param('customerId') customerId: string) {
    const result = await this.ordersService.getOrderHistory(customerId, {}, 1, 50);
    return {
      code: 0,
      message: 'Órdenes encontradas',
      data: result.orders
    };
  }
}
