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
import { ServiceMonthOptionService } from '../services/service-month-option.service';
import { CreateServiceMonthOptionDto, UpdateServiceMonthOptionDto } from '../dto/service-plans.dto';

@Controller('api/admin/services/month-options')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
export class AdminMonthOptionsController {
  constructor(private readonly monthOptionService: ServiceMonthOptionService) {}

  /**
   * 📋 Obtener todas las opciones de mes
   * GET /api/admin/services/month-options
   */
  @Get()
  @Permissions('services:read')
  async findAll(@Query('serviceId') serviceId?: string) {
    const options = await this.monthOptionService.findAll(serviceId);
    return {
      success: true,
      message: 'Opciones de mes obtenidas exitosamente',
      data: options
    };
  }

  /**
   * 🔍 Obtener opciones de mes por servicio
   * GET /api/admin/services/month-options/service/:serviceId
   */
  @Get('service/:serviceId')
  @Permissions('services:read')
  async findByService(@Param('serviceId') serviceId: string) {
    const options = await this.monthOptionService.findByService(serviceId);
    return {
      success: true,
      message: 'Opciones de mes del servicio obtenidas exitosamente',
      data: options
    };
  }

  /**
   * 🔍 Obtener opción de mes por ID
   * GET /api/admin/services/month-options/:id
   */
  @Get(':id')
  @Permissions('services:read')
  async findOne(@Param('id') id: number) {
    const option = await this.monthOptionService.findOne(id);
    return {
      success: true,
      message: 'Opción de mes obtenida exitosamente',
      data: option
    };
  }

  /**
   * ➕ Crear nueva opción de mes
   * POST /api/admin/services/month-options/:serviceId
   */
  @Post(':serviceId')
  @Permissions('services:create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('serviceId') serviceId: string,
    @Body() createDto: CreateServiceMonthOptionDto
  ) {
    const option = await this.monthOptionService.create(serviceId, createDto);
    return {
      success: true,
      message: 'Opción de mes creada exitosamente',
      data: option
    };
  }

  /**
   * ✏️ Actualizar opción de mes
   * PUT /api/admin/services/month-options/:id
   */
  @Put(':id')
  @Permissions('services:update')
  async update(@Param('id') id: number, @Body() updateDto: UpdateServiceMonthOptionDto) {
    const option = await this.monthOptionService.update(id, updateDto);
    return {
      success: true,
      message: 'Opción de mes actualizada exitosamente',
      data: option
    };
  }

  /**
   * 🗑️ Eliminar opción de mes
   * DELETE /api/admin/services/month-options/:id
   */
  @Delete(':id')
  @Permissions('services:delete')
  async remove(@Param('id') id: number) {
    await this.monthOptionService.remove(id);
    return {
      success: true,
      message: 'Opción de mes eliminada exitosamente'
    };
  }

  /**
   * 🔄 Toggle estado activo/inactivo
   * PUT /api/admin/services/month-options/:id/toggle-status
   */
  @Put(':id/toggle-status')
  @Permissions('services:update')
  async toggleActive(@Param('id') id: number) {
    const option = await this.monthOptionService.toggleActive(id);
    return {
      success: true,
      message: `Opción de mes ${option.active ? 'activada' : 'desactivada'} exitosamente`,
      data: option
    };
  }

  /**
   * ⭐ Establecer como default
   * PUT /api/admin/services/month-options/:id/set-default
   */
  @Put(':id/set-default')
  @Permissions('services:update')
  async setDefault(@Param('id') id: number) {
    const option = await this.monthOptionService.setDefault(id);
    return {
      success: true,
      message: 'Opción de mes establecida como default exitosamente',
      data: option
    };
  }

  /**
   * 📊 Estadísticas de opciones de mes
   * GET /api/admin/services/month-options/stats/summary
   */
  @Get('stats/summary')
  @Permissions('services:read')
  async getStats() {
    const stats = await this.monthOptionService.getStats();
    return {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    };
  }
}
