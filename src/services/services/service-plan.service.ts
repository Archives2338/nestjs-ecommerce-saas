import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  ServicePlan, 
  ServicePlanDocument 
} from '../schemas-new/service-plan.schema';
import { 
  CreateServicePlanDto, 
  UpdateServicePlanDto,
  GetServicePlansDto 
} from '../dto/service-plans.dto';
import { ServiceMonthOptionService } from './service-month-option.service';
import { ServiceScreenOptionService } from './service-screen-option.service';

@Injectable()
export class ServicePlanService {
  @InjectModel('Service')
  private serviceModel: Model<any>;

  /**
   * Sincroniza el campo 'plan' en el schema principal del servicio
   */
  // async syncServicePlanField(serviceId: string) {
  //   // Obtiene todos los planes activos del servicio
  //   const plans = await this.findByService(serviceId, 'plan');
  //   // Estructura los datos para el campo 'plan' del schema principal
  //   // Aquí puedes adaptar la lógica según la estructura que necesites
  //   const planItems = plans.map(plan => ({
  //     month_id: plan.month_id,
  //     screen_id: plan.screen_id,
  //     type_plan_id: plan.type_plan_id,
  //     sort: plan.sort,
  //     currency_icon1: plan.currency_icon1,
  //     currency_icon2: plan.currency_icon2,
  //     currency_show_type: plan.currency_show_type,
  //     original_price: plan.original_price,
  //     sale_price: plan.sale_price,
  //     average_price: plan.average_price,
  //     discount: plan.discount
  //   }));
  //   console.log(`Sincronizando planes para el servicio ${serviceId}:`, planItems);
  //   // Actualiza el campo 'plan' en el documento principal del servicio
  //   await this.serviceModel.updateOne(
  //     { _id: new Types.ObjectId(serviceId) },
  //     { $set: { 'plan.month': planItems } }
  //   ).exec();
  // }
  constructor(
    @InjectModel(ServicePlan.name) 
    private planModel: Model<ServicePlanDocument>,
    private monthOptionService: ServiceMonthOptionService,
    private screenOptionService: ServiceScreenOptionService
  ) {}

  async findAll(filters: GetServicePlansDto = {}) {
    const query: any = {};

    if (filters.serviceId) {
      query.serviceId = new Types.ObjectId(filters.serviceId);
    }

    if (filters.month_id) {
      query.month_id = filters.month_id;
    }

    if (filters.screen_id) {
      query.screen_id = filters.screen_id;
    }

    if (filters.plan_type) {
      query.plan_type = filters.plan_type;
    }

    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    return await this.planModel
      .find(query)
      .sort({ sort: 1, sale_price: 1 })
      .exec();
  }

  async findByService(serviceId: string, planType: 'plan' | 'repayment' = 'plan') {
    return await this.planModel
      .find({ 
        serviceId: new Types.ObjectId(serviceId), 
        plan_type: planType,
        active: true 
      })
      .sort({ sort: 1, sale_price: 1 })
      .exec();
  }

  async findOne(planId: number) {
    const plan = await this.planModel.findOne({ type_plan_id: planId }).exec();
    if (!plan) {
      throw new NotFoundException(`Plan con ID ${planId} no encontrado`);
    }
    return plan;
  }

  async findByCombo(serviceId: string, monthId: number, screenId: number, planType: 'plan' | 'repayment' = 'plan') {
    return await this.planModel.findOne({
      serviceId: new Types.ObjectId(serviceId),
      month_id: monthId,
      screen_id: screenId,
      plan_type: planType
    }).exec();
  }

  async create(serviceId: string, createDto: CreateServicePlanDto) {
    // Verificar que existan las opciones de mes y pantalla
    await this.monthOptionService.findOne(createDto.month_id);
    await this.screenOptionService.findOne(createDto.screen_id);

    // Verificar si ya existe esta combinación
    const existing = await this.findByCombo(
      serviceId, 
      createDto.month_id, 
      createDto.screen_id, 
      createDto.plan_type
    );

    if (existing) {
      throw new ConflictException(
        `Ya existe un plan ${createDto.plan_type} para la combinación mes ${createDto.month_id} + pantalla ${createDto.screen_id}`
      );
    }

    // Validar precios
    if (createDto.sale_price > createDto.original_price) {
      throw new BadRequestException('El precio de venta no puede ser mayor al precio original');
    }

    // Generar type_plan_id único
    const lastPlan = await this.planModel
      .findOne({}, {}, { sort: { type_plan_id: -1 } })
      .exec();
    
    const newPlanId = lastPlan ? lastPlan.type_plan_id + 1 : 1;

    const newPlan = new this.planModel({
      ...createDto,
      type_plan_id: newPlanId,
      serviceId: new Types.ObjectId(serviceId)
    });

    return await newPlan.save();
  }

  async update(planId: number, updateDto: UpdateServicePlanDto) {
    const plan = await this.findOne(planId);

    // Validar precios si se están actualizando
    if (updateDto.sale_price && updateDto.original_price) {
      if (updateDto.sale_price > updateDto.original_price) {
        throw new BadRequestException('El precio de venta no puede ser mayor al precio original');
      }
    } else if (updateDto.sale_price && updateDto.sale_price > plan.original_price) {
      throw new BadRequestException('El precio de venta no puede ser mayor al precio original');
    } else if (updateDto.original_price && plan.sale_price > updateDto.original_price) {
      throw new BadRequestException('El precio original no puede ser menor al precio de venta');
    }

    // Si se está cambiando la combinación mes+pantalla, verificar que no exista
    if ((updateDto.month_id && updateDto.month_id !== plan.month_id) || 
        (updateDto.screen_id && updateDto.screen_id !== plan.screen_id) ||
        (updateDto.plan_type && updateDto.plan_type !== plan.plan_type)) {
      
      const existing = await this.findByCombo(
        plan.serviceId.toString(),
        updateDto.month_id || plan.month_id,
        updateDto.screen_id || plan.screen_id,
        updateDto.plan_type || plan.plan_type
      );

      if (existing && existing.type_plan_id !== planId) {
        throw new ConflictException('Ya existe un plan con esa combinación');
      }
    }

    Object.assign(plan, updateDto);
    return await plan.save();
  }

  async remove(planId: number) {
    const plan = await this.findOne(planId);
    return await this.planModel.deleteOne({ type_plan_id: planId }).exec();
  }

  async toggleActive(planId: number) {
    const plan = await this.findOne(planId);
    plan.active = !plan.active;
    return await plan.save();
  }

  async bulkUpdatePrices(serviceId: string, priceMultiplier: number) {
    const plans = await this.findByService(serviceId);
    
    const bulkOps = plans.map(plan => ({
      updateOne: {
        filter: { type_plan_id: plan.type_plan_id },
        update: {
          original_price: Math.round(plan.original_price * priceMultiplier * 100) / 100,
          sale_price: Math.round(plan.sale_price * priceMultiplier * 100) / 100,
          average_price: Math.round(plan.average_price * priceMultiplier * 100) / 100
        }
      }
    }));

    return await this.planModel.bulkWrite(bulkOps);
  }

  async getServicePricingMatrix(serviceId: string, planType: 'plan' | 'repayment' = 'plan') {
    const plans = await this.findByService(serviceId, planType);
    const monthOptions = await this.monthOptionService.findByService(serviceId);
    const screenOptions = await this.screenOptionService.findByService(serviceId);

    // Crear matriz de precios
    const matrix = monthOptions.map(month => ({
      month_id: month.month_id,
      month: month.month,
      month_content: month.month_content,
      screens: screenOptions.map(screen => {
        const plan = plans.find(p => p.month_id === month.month_id && p.screen_id === screen.screen_id);
        return {
          screen_id: screen.screen_id,
          screen: screen.screen,
          screen_content: screen.screen_content,
          max_user: screen.max_user,
          plan: plan ? {
            type_plan_id: plan.type_plan_id,
            sale_price: plan.sale_price,
            original_price: plan.original_price,
            discount: plan.discount,
            active: plan.active
          } : null
        };
      })
    }));

    return {
      service_id: serviceId,
      plan_type: planType,
      matrix,
      summary: {
        total_combinations: monthOptions.length * screenOptions.length,
        configured_plans: plans.length,
        missing_plans: (monthOptions.length * screenOptions.length) - plans.length
      }
    };
  }

  async getStats() {
    const total = await this.planModel.countDocuments().exec();
    const active = await this.planModel.countDocuments({ active: true }).exec();
    
    const priceStats = await this.planModel.aggregate([
      {
        $group: {
          _id: null,
          min_price: { $min: '$sale_price' },
          max_price: { $max: '$sale_price' },
          avg_price: { $avg: '$sale_price' }
        }
      }
    ]).exec();

    const byPlanType = await this.planModel.aggregate([
      { $group: { _id: '$plan_type', count: { $sum: 1 } } }
    ]).exec();

    return {
      total,
      active,
      inactive: total - active,
      price_range: priceStats[0] || { min_price: 0, max_price: 0, avg_price: 0 },
      by_plan_type: byPlanType
    };
  }
}
