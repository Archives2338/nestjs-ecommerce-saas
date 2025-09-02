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

      // Filtrar arrays vacíos en plan.month y plan.screen
      if (service && service.plan) {
        if (Array.isArray(service.plan.month)) {
          service.plan.month = service.plan.month.filter(m => Array.isArray(m.screen) && m.screen.length > 0);
        }
        if (Array.isArray(service.plan.screen)) {
          service.plan.screen = service.plan.screen.filter(s => Array.isArray(s.month) && s.month.length > 0);
        }
      }
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
// deseo crear un language es y un type_id automatico tambien

      createServiceDto.language = 'es';
      createServiceDto.type_id = await this.getNextTypeId();

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
  getNextTypeId(): number | PromiseLike<number> {

      return this.serviceModel.findOne({}, {}, { sort: { type_id: -1 } }).then(service => {
        return service ? service.type_id + 1 : 1;
      });
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

  // ==================== MÉTODOS PARA ADMINISTRACIÓN ====================

  /**
   * Obtener todos los servicios para administración con paginación y filtros
   */
  async getAllServicesForAdmin(options: {
    language: string;
    active?: boolean;
    page: number;
    limit: number;
  }) {
    try {
      const { language, active, page, limit } = options;
      const skip = (page - 1) * limit;

      // Construir filtros
      const filter: any = { language };
      if (active !== undefined) {
        filter.active = active;
      }

      // Obtener servicios con paginación
      const [services, total] = await Promise.all([
        this.serviceModel
          .find(filter)
          .sort({ sort: 1, created_at: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.serviceModel.countDocuments(filter)
      ]);

      // Formatear datos para administración
      const formattedServices = services.map(service => ({
        id: service._id.toString(),
        type_id: service.type_id,
        name: service.name,
        subtitle: service.subtitle,
        icon: service.icon,
        active: service.active,
        sort: service.sort,
        created_at: service.created_at,
        updated_at: service.updated_at,
        // Estadísticas de planes
        total_plans: this.countTotalPlans(service.plan),
        price_range: this.getPriceRange(service.plan),
        // Información resumida
        summary: {
          total_months: service.plan?.month?.length || 0,
          total_screens: service.plan?.screen?.length || 0,
          has_repayment: service.repayment?.month?.length > 0 || service.repayment?.screen?.length > 0
        }
      }));

      return {
        services: formattedServices,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
          has_next: page < Math.ceil(total / limit),
          has_prev: page > 1
        }
      };

    } catch (error) {
      this.logger.error('Error getting all services for admin:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de servicios
   */
  async getServicesStats(language: string) {
    try {
      const [
        totalServices,
        activeServices,
        inactiveServices,
        servicesWithPlans,
        totalPlans
      ] = await Promise.all([
        this.serviceModel.countDocuments({ language }),
        this.serviceModel.countDocuments({ language, active: true }),
        this.serviceModel.countDocuments({ language, active: false }),
        this.serviceModel.countDocuments({ 
          language, 
          $or: [
            { 'plan.month.0': { $exists: true } },
            { 'plan.screen.0': { $exists: true } }
          ]
        }),
        this.serviceModel.aggregate([
          { $match: { language } },
          {
            $project: {
              planCount: {
                $add: [
                  { $size: { $ifNull: ['$plan.month', []] } },
                  { $size: { $ifNull: ['$plan.screen', []] } }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              totalPlans: { $sum: '$planCount' }
            }
          }
        ])
      ]);

      // Obtener servicios más populares (basado en sort)
      const popularServices = await this.serviceModel
        .find({ language, active: true })
        .sort({ sort: 1 })
        .limit(5)
        .select('name type_id sort')
        .exec();

      return {
        overview: {
          total_services: totalServices,
          active_services: activeServices,
          inactive_services: inactiveServices,
          services_with_plans: servicesWithPlans,
          total_plans: totalPlans[0]?.totalPlans || 0
        },
        popular_services: popularServices.map(service => ({
          id: service.type_id,
          name: service.name,
          sort_order: service.sort
        })),
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error getting services stats:', error);
      throw error;
    }
  }

  /**
   * Obtener un servicio por ID para administración
   */
  async getServiceById(id: string) {
    try {
      const service = await this.serviceModel.findById(id).exec();
      
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      return {
        ...service.toObject(),
        id: service._id.toString(),
        type_id: service.type_id, // Asegurar que type_id esté disponible
        plan_summary: {
          total_months: service.plan?.month?.length || 0,
          total_screens: service.plan?.screen?.length || 0,
          total_plans: this.countTotalPlans(service.plan),
          price_range: this.getPriceRange(service.plan)
        }
      };

    } catch (error) {
      this.logger.error(`Error getting service by ID ${id}:`, error);
      throw error;
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Contar total de planes en un servicio
   */
  private countTotalPlans(plan: any): number {
    if (!plan) return 0;
    
    let total = 0;
    
    // Contar planes por mes
    if (plan.month && Array.isArray(plan.month)) {
      plan.month.forEach((monthGroup: any) => {
        if (monthGroup.screen && Array.isArray(monthGroup.screen)) {
          total += monthGroup.screen.length;
        }
      });
    }
    
    return total;
  }

  /**
   * Obtener rango de precios de un servicio
   */
  private getPriceRange(plan: any): { min: number; max: number; currency: string } {
    if (!plan) return { min: 0, max: 0, currency: 'PEN' };
    
    const prices: number[] = [];
    
    // Recopilar todos los precios
    if (plan.month && Array.isArray(plan.month)) {
      plan.month.forEach((monthGroup: any) => {
        if (monthGroup.screen && Array.isArray(monthGroup.screen)) {
          monthGroup.screen.forEach((screenPlan: any) => {
            if (screenPlan.sale_price) {
              prices.push(parseFloat(screenPlan.sale_price));
            }
            if (screenPlan.original_price) {
              prices.push(parseFloat(screenPlan.original_price));
            }
          });
        }
      });
    }
    
    if (prices.length === 0) {
      return { min: 0, max: 0, currency: 'PEN' };
    }
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      currency: 'PEN'
    };
  }
}
