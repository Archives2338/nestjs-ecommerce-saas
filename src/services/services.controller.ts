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
  HttpCode
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
      this.logger.log(`Getting SKU list for type_id: ${getSkuListDto.type_id}, language: ${getSkuListDto.language}`);
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
        type_id: parseInt(id),
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
}
