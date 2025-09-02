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
import { ServiceScreenOptionService } from '../services/service-screen-option.service';
import { CreateServiceScreenOptionDto, UpdateServiceScreenOptionDto } from '../dto/service-plans.dto';

@Controller('api/admin/services/screen-options')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
export class AdminScreenOptionsController {
  constructor(private readonly screenOptionService: ServiceScreenOptionService) {}

  /**
   * 📋 Obtener todas las opciones de pantalla
   * GET /api/admin/services/screen-options
   */
  @Get()
  @Permissions('services:read')
  async findAll(@Query('serviceId') serviceId?: string) {
    const options = await this.screenOptionService.findAll(serviceId);
    return {
      success: true,
      message: 'Opciones de pantalla obtenidas exitosamente',
      data: options
    };
  }

  /**
   * 🔍 Obtener opciones de pantalla por servicio
   * GET /api/admin/services/screen-options/service/:serviceId
   */
  @Get('service/:serviceId')
  @Permissions('services:read')
  async findByService(@Param('serviceId') serviceId: string) {
    const options = await this.screenOptionService.findByService(serviceId);
    return {
      success: true,
      message: 'Opciones de pantalla del servicio obtenidas exitosamente',
      data: options
    };
  }

  /**
   * 🔍 Obtener opción de pantalla por ID
   * GET /api/admin/services/screen-options/:id
   */
  @Get(':id')
  @Permissions('services:read')
  async findOne(@Param('id') id: number) {
    const option = await this.screenOptionService.findOne(id);
    return {
      success: true,
      message: 'Opción de pantalla obtenida exitosamente',
      data: option
    };
  }

  /**
   * ➕ Crear nueva opción de pantalla
   * POST /api/admin/services/screen-options/:serviceId
   */
  @Post(':serviceId')
  @Permissions('services:create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('serviceId') serviceId: string,
    @Body() createDto: CreateServiceScreenOptionDto
  ) {
    const option = await this.screenOptionService.create(serviceId, createDto);
    return {
      success: true,
      message: 'Opción de pantalla creada exitosamente',
      data: option
    };
  }

  /**
   * ✏️ Actualizar opción de pantalla
   * PUT /api/admin/services/screen-options/:id
   */
  @Put(':id')
  @Permissions('services:update')
  async update(@Param('id') id: number, @Body() updateDto: UpdateServiceScreenOptionDto) {
    const option = await this.screenOptionService.update(id, updateDto);
    return {
      success: true,
      message: 'Opción de pantalla actualizada exitosamente',
      data: option
    };
  }

  /**
   * 🗑️ Eliminar opción de pantalla
   * DELETE /api/admin/services/screen-options/:id
   */
  @Delete(':id')
  @Permissions('services:delete')
  async remove(@Param('id') id: number) {
    await this.screenOptionService.remove(id);
    return {
      success: true,
      message: 'Opción de pantalla eliminada exitosamente'
    };
  }

  /**
   * 🔄 Toggle estado activo/inactivo
   * PUT /api/admin/services/screen-options/:id/toggle-status
   */
  @Put(':id/toggle-status')
  @Permissions('services:update')
  async toggleActive(@Param('id') id: number) {
    const option = await this.screenOptionService.toggleActive(id);
    return {
      success: true,
      message: `Opción de pantalla ${option.active ? 'activada' : 'desactivada'} exitosamente`,
      data: option
    };
  }

  /**
   * ⭐ Establecer como default
   * PUT /api/admin/services/screen-options/:id/set-default
   */
  @Put(':id/set-default')
  @Permissions('services:update')
  async setDefault(@Param('id') id: number) {
    const option = await this.screenOptionService.setDefault(id);
    return {
      success: true,
      message: 'Opción de pantalla establecida como default exitosamente',
      data: option
    };
  }

  /**
   * 📊 Estadísticas de opciones de pantalla
   * GET /api/admin/services/screen-options/stats/summary
   */
  @Get('stats/summary')
  @Permissions('services:read')
  async getStats() {
    const stats = await this.screenOptionService.getStats();
    return {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    };
  }

  /**
   * 📈 Opciones más populares por cantidad de pantallas
   * GET /api/admin/services/screen-options/stats/popular
   */
  @Get('stats/popular')
  @Permissions('services:read')
  async getPopularScreenCounts() {
    const popular = await this.screenOptionService.getPopularScreenCounts();
    return {
      success: true,
      message: 'Opciones populares obtenidas exitosamente',
      data: popular
    };
  }
}
