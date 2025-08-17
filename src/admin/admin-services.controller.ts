import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Param, 
  Body, 
  Query, 
  Logger,
  HttpStatus,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto, UpdateServiceDto } from '../services/dto/service.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';

/**
 * Controlador para administración de servicios
 * Endpoints protegidos para administradores
 */
@Controller('api/admin/services')
@UseGuards(AdminJwtAuthGuard)
export class AdminServicesController {
  private readonly logger = new Logger(AdminServicesController.name);

  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Listar todos los servicios con información resumida para administración
   * GET /api/admin/services
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllServices(
    @Query('language') language: string = 'es',
    @Query('active') active?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    try {
      this.logger.log(`Admin getting all services - language: ${language}, active: ${active}, page: ${page}, limit: ${limit}`);
      
      const result = await this.servicesService.getAllServicesForAdmin({
        language,
        active: active !== undefined ? active === 'true' : undefined,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      return {
        code: 0,
        message: 'Servicios obtenidos exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: result
      };
    } catch (error) {
      this.logger.error('Error getting all services for admin:', error);
      return {
        code: 1,
        message: 'Error al obtener servicios',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Obtener estadísticas resumidas de servicios
   * GET /api/admin/services/stats
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getServicesStats(@Query('language') language: string = 'es') {
    try {
      this.logger.log(`Getting services stats for language: ${language}`);
      
      const stats = await this.servicesService.getServicesStats(language);

      return {
        code: 0,
        message: 'Estadísticas obtenidas exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: stats
      };
    } catch (error) {
      this.logger.error('Error getting services stats:', error);
      return {
        code: 1,
        message: 'Error al obtener estadísticas',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Obtener un servicio específico por ID
   * GET /api/admin/services/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getServiceById(@Param('id') id: string) {
    try {
      this.logger.log(`Getting service by ID: ${id}`);
      
      const service = await this.servicesService.getServiceById(id);

      return {
        code: 0,
        message: 'Servicio obtenido exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: service
      };
    } catch (error) {
      this.logger.error(`Error getting service by ID ${id}:`, error);
      return {
        code: 1,
        message: 'Error al obtener el servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Crear un nuevo servicio
   * POST /api/admin/services
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createService(@Body() createServiceDto: CreateServiceDto) {
    try {
      this.logger.log(`Creating new service: ${createServiceDto.name}`);
      
      const result = await this.servicesService.createService(createServiceDto);

      return {
        code: 0,
        message: 'Servicio creado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: result
      };
    } catch (error) {
      this.logger.error('Error creating service:', error);
      return {
        code: 1,
        message: 'Error al crear el servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Actualizar un servicio existente
   * PUT /api/admin/services/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Query('language') language: string = 'es'
  ) {
    try {
      this.logger.log(`Updating service ID: ${id}`);
      
      // Buscar el servicio por ID de MongoDB
      const service = await this.servicesService.getServiceById(id);
      
      // Actualizar usando language y type_id
      const result = await this.servicesService.updateService(
        language, 
        service.type_id, 
        updateServiceDto
      );

      return {
        code: 0,
        message: 'Servicio actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error updating service ${id}:`, error);
      return {
        code: 1,
        message: 'Error al actualizar el servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Activar/Desactivar un servicio
   * POST /api/admin/services/:id/toggle-status
   */
  @Post(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async toggleServiceStatus(
    @Param('id') id: string,
    @Query('language') language: string = 'es'
  ) {
    try {
      this.logger.log(`Toggling status for service ID: ${id}`);
      
      // Buscar el servicio por ID de MongoDB
      const service = await this.servicesService.getServiceById(id);
      
      // Cambiar estado usando language y type_id
      const result = await this.servicesService.toggleServiceStatus(
        language, 
        service.type_id
      );

      return {
        code: 0,
        message: 'Estado del servicio actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error toggling service status ${id}:`, error);
      return {
        code: 1,
        message: 'Error al cambiar el estado del servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Eliminar un servicio
   * DELETE /api/admin/services/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteService(
    @Param('id') id: string,
    @Query('language') language: string = 'es'
  ) {
    try {
      this.logger.log(`Deleting service ID: ${id}`);
      
      // Buscar el servicio por ID de MongoDB
      const service = await this.servicesService.getServiceById(id);
      
      // Eliminar usando language y type_id
      const result = await this.servicesService.deleteService(
        language, 
        service.type_id
      );

      return {
        code: 0,
        message: 'Servicio eliminado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error deleting service ${id}:`, error);
      return {
        code: 1,
        message: 'Error al eliminar el servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }
}
