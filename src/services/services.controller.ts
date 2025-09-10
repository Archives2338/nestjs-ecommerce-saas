import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Patch,
  Param, 
  Body, 
  Query, 
  Logger,
  HttpStatus,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { GetSkuListDto, CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Controller('api')
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);

  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Endpoint para obtener detalles de un servicio específico (compatible con getSkuList)
   * POST /api/index/getSkuList
   * Body: { language: string, type_id: number, source: number }
   */
  @Post('index/getSkuList')
  @HttpCode(HttpStatus.OK)
  async getSkuList(@Body() getSkuListDto: GetSkuListDto) {
    try {
      this.logger.log(`Getting SKU list for serviceId: ${getSkuListDto.serviceId}, language: ${getSkuListDto.language}`);
      return await this.servicesService.getSkuList(getSkuListDto);
    } catch (error) {
      this.logger.error('Error in getSkuList endpoint:', error);
      return {
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Endpoint alternativo para obtener detalles de un servicio
   * GET /api/services/details/:language/:id
   */
  @Get('services/details/:language/:id')
  async getServiceDetails(
    @Param('language') language: string,
    @Param('id') id: string,
    @Query('source') source: number = 2
  ) {
    try {
      const getSkuListDto: GetSkuListDto = {
        language,
        serviceId: id,
        source
      };
      return await this.servicesService.getSkuList(getSkuListDto);
    } catch (error) {
      this.logger.error('Error in getServiceDetails endpoint:', error);
      return {
        code: 1,
        message: 'Error al obtener detalles del servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Obtener todos los servicios disponibles
   * GET /api/services/:language
   */
  @Get('services/:language')
  async getAllServices(@Param('language') language: string) {
    try {
      this.logger.log(`Getting all services for language: ${language}`);
      return await this.servicesService.getAllServices(language);
    } catch (error) {
      this.logger.error('Error in getAllServices endpoint:', error);
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
   * Crear un nuevo servicio
   * POST /api/services
   */
  @Post('services')
  async createService(@Body() createServiceDto: CreateServiceDto) {
    try {
      this.logger.log(`Creating new service: ${createServiceDto.name}`);
      return await this.servicesService.createService(createServiceDto);
    } catch (error) {
      this.logger.error('Error in createService endpoint:', error);
      return {
        code: 1,
        message: 'Error al crear servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Actualizar un servicio existente
   * PUT /api/services/:language/:id
   */
  @Put('services/:language/:id')
  async updateService(
    @Param('language') language: string,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto
  ) {
    try {
      this.logger.log(`Updating service ${id} for language: ${language}`);
      return await this.servicesService.updateService(language, parseInt(id), updateServiceDto);
    } catch (error) {
      this.logger.error('Error in updateService endpoint:', error);
      return {
        code: 1,
        message: 'Error al actualizar servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Eliminar un servicio (soft delete)
   * DELETE /api/services/:language/:id
   */
  @Delete('services/:language/:id')
  async deleteService(
    @Param('language') language: string,
    @Param('id') id: string
  ) {
    try {
      this.logger.log(`Deleting service ${id} for language: ${language}`);
      return await this.servicesService.deleteService(language, parseInt(id));
    } catch (error) {
      this.logger.error('Error in deleteService endpoint:', error);
      return {
        code: 1,
        message: 'Error al eliminar servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Activar/desactivar un servicio
   * PATCH /api/services/:language/:id/toggle
   */
  @Patch('services/:language/:id/toggle')
  async toggleServiceStatus(
    @Param('language') language: string,
    @Param('id') id: string
  ) {
    try {
      this.logger.log(`Toggling service status for ${id} in language: ${language}`);
      return await this.servicesService.toggleServiceStatus(language, parseInt(id));
    } catch (error) {
      this.logger.error('Error in toggleServiceStatus endpoint:', error);
      return {
        code: 1,
        message: 'Error al cambiar estado del servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  // ==================== ENDPOINTS DE ADMINISTRACIÓN ====================

  /**
   * Listar todos los servicios para administración con paginación
   * GET /api/admin/services
   */
  @Get('admin/services')
  @HttpCode(HttpStatus.OK)
  async getAllServicesForAdmin(
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
   * Obtener estadísticas de servicios para administración
   * GET /api/admin/services/stats
   */
  @Get('admin/services/stats')
  @HttpCode(HttpStatus.OK)
  async getServicesStatsForAdmin(@Query('language') language: string = 'es') {
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
   * Obtener un servicio específico por ID para administración
   * GET /api/admin/services/:id
   */
  @Get('admin/services/:id')
  @HttpCode(HttpStatus.OK)
  async getServiceByIdForAdmin(@Param('id') id: string) {
    try {
      this.logger.log(`Getting service by ID for admin: ${id}`);
      
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
   * Actualizar un servicio por ID para administración
   * PUT /api/admin/services/:id
   */
  @Put('admin/services/:id')
  @HttpCode(HttpStatus.OK)
  async updateServiceByIdForAdmin(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Query('language') language: string = 'es'
  ) {
    try {
      this.logger.log(`Updating service ID for admin: ${id}`);
      
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
   * Cambiar estado de un servicio para administración
   * POST /api/admin/services/:id/toggle-status
   */
  @Post('admin/services/:id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async toggleServiceStatusForAdmin(
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
   * Eliminar un servicio para administración
   * DELETE /api/admin/services/:id
   */
  @Delete('admin/services/:id')
  @HttpCode(HttpStatus.OK)
  async deleteServiceForAdmin(
    @Param('id') id: string,
    @Query('language') language: string = 'es'
  ) {
    try {
      this.logger.log(`Deleting service ID for admin: ${id}`);
      
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
