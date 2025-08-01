import { Controller, Post, Get, Put, Body, Param, Req, UploadedFile, UseInterceptors, HttpStatus, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';

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

  /**
   * Crear nueva orden
   * POST /api/orders
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async createOrder(@Body() data: Partial<Order>, @Req() req: any) {
    // TODO: extraer customerId del JWT en producción
    const customerId = req.user?.id || data.customer;
    const order = await this.ordersService.createOrder({ ...data, customer: customerId });
    return {
      code: 0,
      message: 'Orden creada',
      data: order
    };
  }

  /**
   * Adjuntar comprobante de pago (URL y texto OCR)
   * PUT /api/orders/:id/comprobante
   */
  @Put(':id/comprobante')
  @HttpCode(HttpStatus.OK)
  async attachComprobante(@Param('id') orderId: string, @Body() body: { comprobanteUrl: string, comprobanteOcrText?: string }) {
    // Si se provee comprobanteOcrText, lo pasa como texto; si no, solo adjunta la URL
    let imageBuffer: Buffer | undefined = undefined;
    if (body.comprobanteOcrText && Buffer.isBuffer(body.comprobanteOcrText)) {
      imageBuffer = body.comprobanteOcrText as unknown as Buffer;
    }
    const order = await this.ordersService.attachComprobante(orderId, body.comprobanteUrl, imageBuffer);
    return {
      code: order ? 0 : 1,
      message: order ? 'Comprobante adjuntado' : 'Orden no encontrada',
      data: order
    };
  }

  /**
   * Actualizar estado de la orden
   * PUT /api/orders/:id/status
   */
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(@Param('id') orderId: string, @Body() body: { status: string }) {
    const order = await this.ordersService.updateOrderStatus(orderId, body.status);
    return {
      code: order ? 0 : 1,
      message: order ? 'Estado actualizado' : 'Orden no encontrada',
      data: order
    };
  }

  /**
   * Obtener orden por ID
   * GET /api/orders/:id
   */
  @Get(':id')
  async getOrder(@Param('id') orderId: string) {
    const order = await this.ordersService.findOrderById(orderId);
    return {
      code: order ? 0 : 1,
      message: order ? 'Orden encontrada' : 'Orden no encontrada',
      data: order
    };
  }

  /**
   * Listar órdenes de un cliente
   * GET /api/orders/customer/:customerId
   */
  @Get('customer/:customerId')
  async listOrdersByCustomer(@Param('customerId') customerId: string) {
    const orders = await this.ordersService.listOrdersByCustomer(customerId);
    return {
      code: 0,
      message: 'Órdenes encontradas',
      data: orders
    };
  }
}
