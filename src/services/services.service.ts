import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { GetSkuListDto, CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  /**
   * Obtener detalles de un servicio específico (equivalente a getSkuList)
   * GET /api/services/sku-list
   */
  async getSkuList(getSkuListDto: GetSkuListDto) {
    try {
      const { language, type_id, source } = getSkuListDto;
      
      this.logger.log(`Getting service details for type_id: ${type_id}, language: ${language}, source: ${source}`);

      const service = await this.serviceModel.findOne({
        language,
        type_id: type_id,
        active: true
      }).exec();

      if (!service) {
        throw new NotFoundException(`Service with type_id ${type_id} not found for language ${language}`);
      }

      // Estructura de respuesta compatible con la API original
      return {
        code: 0,
        message: 'Listo',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          id: service.type_id,
          _id: service._id.toString(), // ✅ Agregar ObjectId para createOrder
          show_status: service.active ? 5 : 0, // Coincide con el ejemplo (5)
          type_name: service.name,
          thumb_img: service.icon,
          selectInfo: "Seleccionar tipo", // String como en la API de referencia
          sku_style_status: false, // Coincide con el ejemplo
          plan: service.plan,
          repayment: service.repayment
        }
      };

    } catch (error) {
      this.logger.error('Error getting service details:', error);
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
   * GET /api/services
   */
  async getAllServices(language: string) {
    try {
      this.logger.log(`Getting all services for language: ${language}`);

      const services = await this.serviceModel.find({
        language,
        active: true
      }).sort({ name: 1 }).exec();

      return {
        code: 0,
        message: 'Servicios obtenidos exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: services.map(service => ({
          id: service.type_id,
          type_name: service.name,
          thumb_img: service.icon,
          show_status: service.active ? 1 : 0,
          subtitle: service.subtitle,
          content: service.content
        }))
      };

    } catch (error) {
      this.logger.error('Error getting all services:', error);
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
  async createService(createServiceDto: CreateServiceDto) {
    try {
      this.logger.log(`Creating service: ${createServiceDto.name} for language: ${createServiceDto.language}`);

      const existingService = await this.serviceModel.findOne({
        type_id: createServiceDto.type_id,
        language: createServiceDto.language
      });

      if (existingService) {
        return {
          code: 1,
          message: 'Ya existe un servicio con este type_id para este idioma',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      const newService = new this.serviceModel(createServiceDto);
      const savedService = await newService.save();

      return {
        code: 0,
        message: 'Servicio creado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          id: savedService.type_id,
          name: savedService.name,
          language: savedService.language,
          active: savedService.active
        }
      };

    } catch (error) {
      this.logger.error('Error creating service:', error);
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
   * Obtener detalles de un servicio específico
   * GET /api/services/:language/:id
   */
  async getServiceDetails(language: string, type_id: number) {
    try {
      this.logger.log(`Getting service details for type_id: ${type_id}, language: ${language}`);

      const service = await this.serviceModel.findOne({
        language,
        type_id,
        active: true
      }).exec();

      if (!service) {
        throw new NotFoundException(`Service with type_id ${type_id} not found for language ${language}`);
      }

      return {
        code: 0,
        message: 'Servicio encontrado',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: service
      };

    } catch (error) {
      this.logger.error('Error getting service details:', error);
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
   * Actualizar un servicio
   * PUT /api/services/:language/:id
   */
  async updateService(language: string, type_id: number, updateServiceDto: UpdateServiceDto) {
    try {
      this.logger.log(`Updating service with type_id: ${type_id}, language: ${language}`);

      const service = await this.serviceModel.findOne({
        language,
        type_id
      });

      if (!service) {
        throw new NotFoundException(`Service with type_id ${type_id} not found for language ${language}`);
      }

      Object.assign(service, updateServiceDto);
      service.updated_at = new Date();
      
      const updatedService = await service.save();

      return {
        code: 0,
        message: 'Servicio actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          id: updatedService.type_id,
          name: updatedService.name,
          language: updatedService.language,
          active: updatedService.active
        }
      };

    } catch (error) {
      this.logger.error('Error updating service:', error);
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
   * Eliminar un servicio
   * DELETE /api/services/:language/:id
   */
  async deleteService(language: string, type_id: number) {
    try {
      this.logger.log(`Deleting service with type_id: ${type_id}, language: ${language}`);

      const result = await this.serviceModel.deleteOne({
        language,
        type_id
      });

      if (result.deletedCount === 0) {
        throw new NotFoundException(`Service with type_id ${type_id} not found for language ${language}`);
      }

      return {
        code: 0,
        message: 'Servicio eliminado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: { deleted: true }
      };

    } catch (error) {
      this.logger.error('Error deleting service:', error);
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
  async toggleServiceStatus(language: string, type_id: number) {
    try {
      this.logger.log(`Toggling service status for type_id: ${type_id}, language: ${language}`);

      const service = await this.serviceModel.findOne({
        language,
        type_id
      });

      if (!service) {
        throw new NotFoundException(`Service with type_id ${type_id} not found for language ${language}`);
      }

      service.active = !service.active;
      service.updated_at = new Date();
      
      const savedService = await service.save();

      return {
        code: 0,
        message: `Servicio ${savedService.active ? 'activado' : 'desactivado'} exitosamente`,
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          id: savedService.type_id,
          name: savedService.name,
          active: savedService.active
        }
      };

    } catch (error) {
      this.logger.error('Error toggling service status:', error);
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
