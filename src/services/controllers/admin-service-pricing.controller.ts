import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../admin/guards/admin-permission.guard';
import { Permissions } from '../../admin/decorators/permissions.decorator';
import { ServicePricingIntegrationService } from '../services/service-pricing-integration.service';
import { CreateCompleteServiceDto } from '../dto/service-plans.dto';

@Controller('api/admin/services/plans')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
export class AdminServicePricingController {
  constructor(private readonly pricingService: ServicePricingIntegrationService) {}

  /**
   * 🎯 Obtener matriz completa de precios
   * GET /api/admin/services/plans/matrix/:serviceId
   */
  @Get('matrix/:serviceId')
  @Permissions('services:read')
  async getPricingMatrix(@Param('serviceId') serviceId: string) {
    const matrix = await this.pricingService.getPricingMatrix(serviceId);
    return {
      success: true,
      message: 'Matriz de precios obtenida exitosamente',
      data: matrix
    };
  }

  /**
   * 📊 Obtener combinaciones faltantes
   * GET /api/admin/services/plans/missing/:serviceId
   */
  @Get('missing/:serviceId')
  @Permissions('services:read')
  async getMissingCombinations(@Param('serviceId') serviceId: string) {
    const missing = await this.pricingService.getMissingCombinations(serviceId);
    return {
      success: true,
      message: 'Combinaciones faltantes obtenidas exitosamente',
      data: missing
    };
  }

  /**
   * 📈 Obtener estadísticas de pricing
   * GET /api/admin/services/plans/stats/:serviceId
   */
  @Get('stats/:serviceId')
  @Permissions('services:read')
  async getPricingStats(@Param('serviceId') serviceId: string) {
    const stats = await this.pricingService.getPricingStats(serviceId);
    return {
      success: true,
      message: 'Estadísticas de pricing obtenidas exitosamente',
      data: stats
    };
  }

  /**
   * 🎯 Obtener estructura completa de pricing (compatible con API actual)
   * GET /api/admin/services/plans/structure/:serviceId
   */
  @Get('structure/:serviceId')
  @Permissions('services:read')
  async getServiceWithPricing(@Param('serviceId') serviceId: string) {
    const pricing = await this.pricingService.getServiceWithPricing(serviceId);
    return {
      success: true,
      message: 'Estructura de pricing obtenida exitosamente',
      data: pricing
    };
  }

  /**
   * 🚀 Crear servicio completo con todas sus opciones y precios
   * POST /api/admin/services/plans/complete
   */
  @Post('complete')
  @Permissions('services:create')
  @HttpCode(HttpStatus.CREATED)
  async createCompleteServicePricing(@Body() createDto: CreateCompleteServiceDto) {
    const result = await this.pricingService.createCompleteServicePricing(
      createDto.serviceId,
      createDto
    );
    return {
      success: true,
      message: 'Servicio completo creado exitosamente',
      data: result
    };
  }

  /**
   *  Validar integridad de pricing para un servicio
   * GET /api/admin/services/plans/validate/:serviceId
   */
  @Get('validate/:serviceId')
  @Permissions('services:read')
  async validateServicePricing(@Param('serviceId') serviceId: string) {
    const validation = await this.pricingService.validateServicePricing(serviceId);
    return {
      success: true,
      message: 'Validación de pricing completada',
      data: validation
    };
  }
}
