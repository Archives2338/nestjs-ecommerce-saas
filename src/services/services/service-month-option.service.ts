import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  ServiceMonthOption, 
  ServiceMonthOptionDocument 
} from '../schemas-new/service-month-option.schema';
import { 
  CreateServiceMonthOptionDto, 
  UpdateServiceMonthOptionDto 
} from '../dto/service-plans.dto';

@Injectable()
export class ServiceMonthOptionService {
  constructor(
    @InjectModel(ServiceMonthOption.name) 
    private monthOptionModel: Model<ServiceMonthOptionDocument>
  ) {}

  async findAll(serviceId?: string) {
    const filter = serviceId ? { serviceId: new Types.ObjectId(serviceId) } : {};
    return await this.monthOptionModel
      .find(filter)
      .sort({ sort: 1, month: 1 })
      .exec();
  }

  async findByService(serviceId: string) {
    return await this.monthOptionModel
      .find({ serviceId: new Types.ObjectId(serviceId) })
      .sort({ sort: 1, month: 1 })
      .exec();
  }

  async findOne(monthId: number) {
    const option = await this.monthOptionModel.findOne({ month_id: monthId }).exec();
    if (!option) {
      throw new NotFoundException(`Opción de mes con ID ${monthId} no encontrada`);
    }
    return option;
  }

  async create(serviceId: string, createDto: CreateServiceMonthOptionDto) {
    // Verificar si ya existe esta combinación
    const existing = await this.monthOptionModel.findOne({
      serviceId: new Types.ObjectId(serviceId),
      month: createDto.month
    }).exec();

    if (existing) {
      throw new ConflictException(
        `Ya existe una opción de ${createDto.month} mes(es) para este servicio`
      );
    }

    // Generar month_id único
    const lastOption = await this.monthOptionModel
      .findOne({}, {}, { sort: { month_id: -1 } })
      .exec();
    
    const newMonthId = lastOption ? lastOption.month_id + 1 : 1;

    const newOption = new this.monthOptionModel({
      ...createDto,
      month_id: newMonthId,
      serviceId: new Types.ObjectId(serviceId)
    });

    return await newOption.save();
  }

  async update(monthId: number, updateDto: UpdateServiceMonthOptionDto) {
    const option = await this.findOne(monthId);
    
    // Si se está actualizando el mes, verificar que no entre en conflicto
    if (updateDto.month && updateDto.month !== option.month) {
      const existing = await this.monthOptionModel.findOne({
        serviceId: option.serviceId,
        month: updateDto.month,
        month_id: { $ne: monthId }
      }).exec();

      if (existing) {
        throw new ConflictException(
          `Ya existe una opción de ${updateDto.month} mes(es) para este servicio`
        );
      }
    }

    Object.assign(option, updateDto);
    return await option.save();
  }

  async remove(monthId: number) {
    const option = await this.findOne(monthId);
    return await this.monthOptionModel.deleteOne({ month_id: monthId }).exec();
  }

  async setDefault(monthId: number) {
    const option = await this.findOne(monthId);
    
    // Remover default de otras opciones del mismo servicio
    await this.monthOptionModel.updateMany(
      { serviceId: option.serviceId },
      { is_default: false }
    ).exec();

    // Establecer como default
    option.is_default = true;
    return await option.save();
  }

  async toggleActive(monthId: number) {
    const option = await this.findOne(monthId);
    option.active = !option.active;
    return await option.save();
  }

  async getStats() {
    const total = await this.monthOptionModel.countDocuments().exec();
    const active = await this.monthOptionModel.countDocuments({ active: true }).exec();
    const byService = await this.monthOptionModel.aggregate([
      { $group: { _id: '$serviceId', count: { $sum: 1 } } }
    ]).exec();

    return {
      total,
      active,
      inactive: total - active,
      by_service: byService.length
    };
  }
}
