import { Controller, Post, Put, Get, Param, Body, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';

import { ValidatePaymentDto, RejectPaymentDto, GetPendingPaymentsDto } from './dto/admin-payment-validation.dto';
import { AdminPaymentValidationService } from './admin-payment-validation.service';
// import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard'; // Implementar guard de admin

@Controller('api/admin/payments')
export class AdminPaymentValidationController {
  constructor(private readonly adminPaymentService: AdminPaymentValidationService) {}

  /**
   * 📋 Obtener comprobantes pendientes de validación
   * GET /api/admin/payments/pending
   */
  @Get('pending')
  // @UseGuards(AdminJwtAuthGuard) // Descomenta cuando implementes autenticación de admin
  async getPendingPayments(@Body() filters?: GetPendingPaymentsDto) {
    return await this.adminPaymentService.getPendingPayments(filters);
  }

  /**
   * ✅ Validar y aprobar comprobante de pago
   * PUT /api/admin/payments/:orderId/approve
   */
  @Put(':orderId/approve')
  // @UseGuards(AdminJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async approvePayment(
    @Param('orderId') orderId: string,
    @Body() validateDto: ValidatePaymentDto
  ) {
    return await this.adminPaymentService.approvePayment(orderId, validateDto);
  }

  /**
   * ❌ Rechazar comprobante de pago
   * PUT /api/admin/payments/:orderId/reject
   */
  @Put(':orderId/reject')
  // @UseGuards(AdminJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async rejectPayment(
    @Param('orderId') orderId: string,
    @Body() rejectDto: RejectPaymentDto
  ) {
    return await this.adminPaymentService.rejectPayment(orderId, rejectDto);
  }

  /**
   * 🔍 Obtener detalles completos de un comprobante
   * GET /api/admin/payments/:orderId/details
   */
  @Get(':orderId/details')
  // @UseGuards(AdminJwtAuthGuard)
  async getPaymentDetails(@Param('orderId') orderId: string) {
    return await this.adminPaymentService.getPaymentDetails(orderId);
  }

  /**
   * 📊 Estadísticas de validaciones
   * GET /api/admin/payments/stats
   */
  @Get('stats')
  // @UseGuards(AdminJwtAuthGuard)
  async getValidationStats() {
    return await this.adminPaymentService.getValidationStats();
  }

  /**
   * 🔄 Re-procesar asignación de credenciales
   * POST /api/admin/payments/:orderId/retry-assignment
   */
  @Post(':orderId/retry-assignment')
  // @UseGuards(AdminJwtAuthGuard)
  async retryCredentialAssignment(@Param('orderId') orderId: string) {
    return await this.adminPaymentService.retryCredentialAssignment(orderId);
  }
}
