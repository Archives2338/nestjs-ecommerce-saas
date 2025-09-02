import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from '../../admin/guards/admin-permission.guard';
import { Permissions } from '../../admin/decorators/permissions.decorator';
import { ServicePlanService } from '../services/service-plan.service';
import { CreateServicePlanDto, UpdateServicePlanDto, GetServicePlansDto, BulkUpdatePricesDto } from '../dto/service-plans.dto';

@Controller('api/admin/services/plans')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
export class AdminServicePlansController {
  constructor(private readonly planService: ServicePlanService) {}

  /**
   * 📋 Obtener todos los planes
   * GET /api/admin/services/plans
   */
  @Get()
  @Permissions('services:read')
  async findAll(
    @Query('serviceId') serviceId?: string,
    @Query('monthId') monthId?: string,
    @Query('screenId') screenId?: string,
    @Query('planType') planType?: 'plan' | 'repayment',
    @Query('active') active?: string
  ) {
    const filters: GetServicePlansDto = {};
    if (serviceId) filters.serviceId = serviceId;
    if (monthId) filters.month_id = parseInt(monthId);
    if (screenId) filters.screen_id = parseInt(screenId);
    if (planType) filters.plan_type = planType;
    if (active !== undefined) filters.active = active === 'true';

    const plans = await this.planService.findAll(filters);
    return {
      success: true,
      message: 'Planes obtenidos exitosamente',
      data: plans
    };
  }

  /**
   * 🔍 Obtener planes por servicio
   * GET /api/admin/services/plans/service/:serviceId
   */
  @Get('service/:serviceId')
  @Permissions('services:read')
  async findByService(
    @Param('serviceId') serviceId: string,
    @Query('planType') planType: 'plan' | 'repayment' = 'plan'
  ) {
    const plans = await this.planService.findByService(serviceId, planType);
    return {
      success: true,
      message: 'Planes del servicio obtenidos exitosamente',
      data: plans
    };
  }

  /**
   * 🔍 Obtener plan por ID
   * GET /api/admin/services/plans/:id
   */
  @Get(':id')
  @Permissions('services:read')
  async findOne(@Param('id') id: number) {
    const plan = await this.planService.findOne(id);
    return {
      success: true,
      message: 'Plan obtenido exitosamente',
      data: plan
    };
  }

  /**
   * ➕ Crear nuevo plan
   * POST /api/admin/services/plans/:serviceId
   */
  @Post(':serviceId')
  @Permissions('services:create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('serviceId') serviceId: string,
    @Body() createDto: CreateServicePlanDto
  ) {
    const plan = await this.planService.create(serviceId, createDto);
    // Ejecuta el script de migración para reconstruir el campo 'plan'
    if (plan && plan.serviceId) {
      const { exec } = require('child_process');
      exec(`node scripts/migrate-service-plan.js ${plan.serviceId.toString()}`);
    }
    return {
      success: true,
      message: 'Plan creado exitosamente',
      data: plan
    };
  }

  /**
   * ✏️ Actualizar plan
   * PUT /api/admin/services/plans/:id
   */
  @Put(':id')
  @Permissions('services:update')
  async update(@Param('id') id: number, @Body() updateDto: UpdateServicePlanDto) {
    const plan = await this.planService.update(id, updateDto);
    // Ejecuta el script de migración para reconstruir el campo 'plan'
    if (plan && plan.serviceId) {
      const { exec } = require('child_process');
      exec(`node scripts/migrate-service-plan.js ${plan.serviceId.toString()}`);
    }
    return {
      success: true,
      message: 'Plan actualizado exitosamente',
      data: plan
    };
  }

  /**
   * 🗑️ Eliminar plan
   * DELETE /api/admin/services/plans/:id
   */
  @Delete(':id')
  @Permissions('services:delete')
  async remove(@Param('id') id: number) {
      const plan = await this.planService.findOne(id);
      console.log("plan",plan)
      await this.planService.remove(id);
    // Ejecuta el script de migración para eliminar el campo 'plan' del servicio
      const { exec } = require('child_process');
      console.log(`Eliminando plan para el servicio ${plan.serviceId.toString()}`);
      exec(`node scripts/migrate-service-plan.js ${plan.serviceId.toString()}`);


    return {
      success: true,
      message: 'Plan eliminado exitosamente'
    };
  }

  /**
   * 🔄 Toggle estado activo/inactivo
   * PUT /api/admin/services/plans/:id/toggle-status
   */
  @Put(':id/toggle-status')
  @Permissions('services:update')
  async toggleActive(@Param('id') id: number) {
    const plan = await this.planService.toggleActive(id);
    return {
      success: true,
      message: `Plan ${plan.active ? 'activado' : 'desactivado'} exitosamente`,
      data: plan
    };
  }

  /**
   * 🎯 Obtener plan por combinación específica
   * GET /api/admin/services/plans/combination/:serviceId/:monthId/:screenId
   */
  @Get('combination/:serviceId/:monthId/:screenId')
  @Permissions('services:read')
  async findByCombo(
    @Param('serviceId') serviceId: string,
    @Param('monthId') monthId: string,
    @Param('screenId') screenId: string,
    @Query('planType') planType: 'plan' | 'repayment' = 'plan'
  ) {
    const plan = await this.planService.findByCombo(
      serviceId, 
      parseInt(monthId), 
      parseInt(screenId), 
      planType
    );
    return {
      success: true,
      message: plan ? 'Plan obtenido exitosamente' : 'No se encontró plan para esta combinación',
      data: plan
    };
  }

  /**
   * 🎯 Obtener plan por combinación específica (alias)
   * GET /api/admin/services/plans/combo/:serviceId/:monthId/:screenId
   */
  @Get('combo/:serviceId/:monthId/:screenId')
  @Permissions('services:read')
  async findByComboAlias(
    @Param('serviceId') serviceId: string,
    @Param('monthId') monthId: string,
    @Param('screenId') screenId: string,
    @Query('planType') planType: 'plan' | 'repayment' = 'plan'
  ) {
    const plan = await this.planService.findByCombo(
      serviceId, 
      parseInt(monthId), 
      parseInt(screenId), 
      planType
    );
    return {
      success: true,
      message: plan ? 'Plan obtenido exitosamente' : 'No se encontró plan para esta combinación',
      data: plan
    };
  }

  /**
   * 📊 Matriz de precios para un servicio
   * GET /api/admin/services/plans/matrix/:serviceId
   */
  @Get('matrix/:serviceId')
  @Permissions('services:read')
  async getServicePricingMatrix(
    @Param('serviceId') serviceId: string,
    @Query('planType') planType: 'plan' | 'repayment' = 'plan'
  ) {
    const matrix = await this.planService.getServicePricingMatrix(serviceId, planType);
    return {
      success: true,
      message: 'Matriz de precios obtenida exitosamente',
      data: matrix
    };
  }

  /**
   * 💰 Actualización masiva de precios
   * PUT /api/admin/services/plans/bulk-update-prices
   */
  @Put('bulk-update-prices')
  @Permissions('services:update')
  async bulkUpdatePrices(@Body() bulkUpdateDto: BulkUpdatePricesDto) {
    const result = await this.planService.bulkUpdatePrices(
      bulkUpdateDto.serviceId, 
      bulkUpdateDto.priceMultiplier
    );
    return {
      success: true,
      message: `${result.modifiedCount || 0} precios actualizados exitosamente`,
      data: result
    };
  }

  /**
   * 📈 Estadísticas de planes
   * GET /api/admin/services/plans/stats/summary
   */
  @Get('stats/summary')
  @Permissions('services:read')
  async getStats() {
    const stats = await this.planService.getStats();
    return {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    };
  }
}
