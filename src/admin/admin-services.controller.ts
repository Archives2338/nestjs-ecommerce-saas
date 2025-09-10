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
  UseGuards,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto, UpdateServiceDto } from '../services/dto/service.dto';
import { CreateServiceMultipartDto, UpdateServiceMultipartDto } from '../services/dto/service-multipart.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { S3Service } from '../files/s3.service';

/**
 * Controlador para administración de servicios
 * Endpoints protegidos para administradores
 */
@Controller('api/admin/services')
@UseGuards(AdminJwtAuthGuard)
export class AdminServicesController {
  private readonly logger = new Logger(AdminServicesController.name);

  constructor(
    private readonly servicesService: ServicesService,
    private readonly s3Service: S3Service
  ) {}

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
   * Acepta un archivo para el ícono que se sube a S3
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('icon'))
  async createService(
    @Body() createServiceMultipartDto: CreateServiceMultipartDto,
    @UploadedFile() iconFile?: Express.Multer.File
  ) {
    try {
      this.logger.log(`Creating new service: ${createServiceMultipartDto.name}`);
      
      // Transformar el DTO multipart al DTO normal
      const createServiceDto: CreateServiceDto = {
        language: createServiceMultipartDto.language || 'es',
        type_id: createServiceMultipartDto.type_id || Math.floor(Math.random() * 1000000),
        icon: '', // Se llenará después si hay archivo
        name: createServiceMultipartDto.name,
        subtitle: createServiceMultipartDto.subtitle,
        content: createServiceMultipartDto.content,
        type: createServiceMultipartDto.type,
        url: createServiceMultipartDto.url || '',
        privacy_url: createServiceMultipartDto.privacy_url || '',
        term_url: createServiceMultipartDto.term_url || '',
        refund_url: createServiceMultipartDto.refund_url || '',
        promotion_url: createServiceMultipartDto.promotion_url || '',
        plan: createServiceMultipartDto.plan || {
          month: [],
          screen: [],
          default_month_id: null,
          default_screen_id: null
        },
        repayment: createServiceMultipartDto.repayment || {
          month: [],
          screen: [],
          default_month_id: null,
          default_screen_id: null
        },
        sort: createServiceMultipartDto.sort || 0,
        active: createServiceMultipartDto.active !== undefined ? createServiceMultipartDto.active : true
      };
      
      // Si se subió un archivo de ícono, procesarlo
      if (iconFile) {
        this.logger.log(`Processing icon file: ${iconFile.originalname}`);
        
        // Validar que sea una imagen
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!this.s3Service.validateFileType(iconFile, allowedTypes)) {
          return {
            code: 1,
            message: 'El archivo del ícono debe ser una imagen (JPEG, PNG, GIF, WebP, SVG)',
            toast: 1,
            redirect_url: '',
            type: 'error',
            data: null
          };
        }

        // Validar tamaño (máximo 5MB para íconos)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!this.s3Service.validateFileSize(iconFile, maxSize)) {
          return {
            code: 1,
            message: 'El archivo del ícono es demasiado grande (máximo 5MB)',
            toast: 1,
            redirect_url: '',
            type: 'error',
            data: null
          };
        }

        // Subir archivo a S3 en carpeta específica para íconos de servicios
        const uploadResult = await this.s3Service.uploadFile(iconFile, 'service-icons');
        
        if (!uploadResult.success) {
          this.logger.error('Error uploading icon to S3:', uploadResult.error);
          return {
            code: 1,
            message: `Error al subir el ícono: ${uploadResult.error}`,
            toast: 1,
            redirect_url: '',
            type: 'error',
            data: null
          };
        }

        // Asignar la URL de S3 al DTO
        createServiceDto.icon = uploadResult.url!;
        this.logger.log(`Icon uploaded successfully: ${uploadResult.url}`);
      } else {
        // Si no hay archivo, usar el valor del DTO multipart si existe
        createServiceDto.icon = createServiceMultipartDto.icon || '';
      }
      
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
   * También acepta un archivo para actualizar el ícono
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('icon'))
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceMultipartDto: UpdateServiceMultipartDto,
    @Query('language') language: string = 'es',
    @UploadedFile() iconFile?: Express.Multer.File
  ) {
    try {
      this.logger.log(`Updating service ID: ${id}`);
      
      // Transformar el DTO multipart al DTO normal
      const updateServiceDto: UpdateServiceDto = {
        icon: updateServiceMultipartDto.icon,
        name: updateServiceMultipartDto.name,
        subtitle: updateServiceMultipartDto.subtitle,
        content: updateServiceMultipartDto.content,
        type: updateServiceMultipartDto.type,
        url: updateServiceMultipartDto.url,
        privacy_url: updateServiceMultipartDto.privacy_url,
        term_url: updateServiceMultipartDto.term_url,
        refund_url: updateServiceMultipartDto.refund_url,
        promotion_url: updateServiceMultipartDto.promotion_url,
        plan: updateServiceMultipartDto.plan,
        repayment: updateServiceMultipartDto.repayment,
        sort: updateServiceMultipartDto.sort,
        active: updateServiceMultipartDto.active
      };
      
      // Si se subió un nuevo archivo de ícono, procesarlo
      if (iconFile) {
        this.logger.log(`Processing new icon file: ${iconFile.originalname}`);
        
        // Validar que sea una imagen
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!this.s3Service.validateFileType(iconFile, allowedTypes)) {
          return {
            code: 1,
            message: 'El archivo del ícono debe ser una imagen (JPEG, PNG, GIF, WebP, SVG)',
            toast: 1,
            redirect_url: '',
            type: 'error',
            data: null
          };
        }

        // Validar tamaño (máximo 5MB para íconos)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!this.s3Service.validateFileSize(iconFile, maxSize)) {
          return {
            code: 1,
            message: 'El archivo del ícono es demasiado grande (máximo 5MB)',
            toast: 1,
            redirect_url: '',
            type: 'error',
            data: null
          };
        }

        // Subir nuevo archivo a S3
        const uploadResult = await this.s3Service.uploadFile(iconFile, 'service-icons');
        
        if (!uploadResult.success) {
          this.logger.error('Error uploading new icon to S3:', uploadResult.error);
          return {
            code: 1,
            message: `Error al subir el nuevo ícono: ${uploadResult.error}`,
            toast: 1,
            redirect_url: '',
            type: 'error',
            data: null
          };
        }

        // Asignar la nueva URL de S3 al DTO
        updateServiceDto.icon = uploadResult.url!;
        this.logger.log(`New icon uploaded successfully: ${uploadResult.url}`);
      }
      
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
