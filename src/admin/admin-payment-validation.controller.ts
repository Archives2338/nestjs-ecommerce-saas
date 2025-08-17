import { Controller, Post, Put, Get, Param, Body, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';

import { ValidatePaymentDto, RejectPaymentDto, GetPendingPaymentsDto } from './dto/admin-payment-validation.dto';
import { AdminPaymentValidationService } from './admin-payment-validation.service';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from './guards/admin-permission.guard';
import { Permissions } from './decorators/permissions.decorator';

@Controller('api/admin/payments')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
export class AdminPaymentValidationController {
  constructor(private readonly adminPaymentService: AdminPaymentValidationService) {}

  /**
   * 📋 Obtener comprobantes pendientes de validación
   * GET /api/admin/payments/pending
   */
  @Get('pending')
  @Permissions('payments:validate', 'payments:read')
  async getPendingPayments(@Body() filters?: GetPendingPaymentsDto) {
    return await this.adminPaymentService.getPendingPayments(filters);
  }

  /**
   * ✅ Validar y aprobar comprobante de pago
   * PUT /api/admin/payments/:orderId/approve
   */
  @Put(':orderId/approve')
  @Permissions('payments:validate')
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
  @Permissions('payments:reject')
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
  @Permissions('payments:read', 'payments:validate')
  async getPaymentDetails(@Param('orderId') orderId: string) {
    return await this.adminPaymentService.getPaymentDetails(orderId);
  }

  /**
   * 📊 Estadísticas de validaciones
   * GET /api/admin/payments/stats
   */
  @Get('stats')
  @Permissions('payments:read')
  async getValidationStats() {
    return await this.adminPaymentService.getValidationStats();
  }

  /**
   * 🔄 Re-procesar asignación de credenciales
   * POST /api/admin/payments/:orderId/retry-assignment
   */
  @Post(':orderId/retry-assignment')
  @Permissions('payments:validate')
  async retryCredentialAssignment(@Param('orderId') orderId: string) {
    return await this.adminPaymentService.retryCredentialAssignment(orderId);
  }
}
