import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  ServiceScreenOption, 
  ServiceScreenOptionDocument 
} from '../schemas-new/service-screen-option.schema';
import { 
  CreateServiceScreenOptionDto, 
  UpdateServiceScreenOptionDto 
} from '../dto/service-plans.dto';
import { throwError } from 'rxjs';

@Injectable()
export class ServiceScreenOptionService {
  constructor(
    @InjectModel(ServiceScreenOption.name) 
    private screenOptionModel: Model<ServiceScreenOptionDocument>
  ) {}

  async findAll(serviceId?: string) {
    const filter = serviceId ? { serviceId: new Types.ObjectId(serviceId) } : {};
    return await this.screenOptionModel
      .find(filter)
      .sort({ sort: 1, screen: 1 })
      .exec();
  }

  async findByService(serviceId: string) {
    return await this.screenOptionModel
      .find({ serviceId: new Types.ObjectId(serviceId) })
      .sort({ sort: 1, screen: 1 })
      .exec();
  }

  async findOne(screenId: number) {
    const option = await this.screenOptionModel.findOne({ screen_id: screenId }).exec();
    if (!option) {
      throw new NotFoundException(`Opción de pantalla con ID ${screenId} no encontrada`);
    }
    return option;
  }

  async create(serviceId: string, createDto: CreateServiceScreenOptionDto) {
    // Verificar si ya existe esta combinación
    const existing = await this.screenOptionModel.findOne({
      serviceId: new Types.ObjectId(serviceId),
      screen: createDto.screen
    }).exec();

    if (existing) {
      throw new ConflictException(
        `Ya existe una opción de ${createDto.screen} pantalla(s) para este servicio`
      );
    }

    // Generar screen_id único
    const lastOption = await this.screenOptionModel
      .findOne({}, {}, { sort: { screen_id: -1 } })
      .exec();
    
    const newScreenId = lastOption ? lastOption.screen_id + 1 : 1;

    const newOption = new this.screenOptionModel({
      ...createDto,
      screen_id: newScreenId,
      serviceId: new Types.ObjectId(serviceId)
    });

    return await newOption.save();
  }

  async update(screenId: number, updateDto: UpdateServiceScreenOptionDto) {
    console.log('Updating screen option:', screenId);
    console.log('With data:', updateDto);
    const option = await this.findOne(screenId);
    console.log('Updating screen option:', option);
    // Si se está actualizando el número de pantallas, verificar que no entre en conflicto
    if (updateDto) {
      Object.assign(option, updateDto);
      console.log('Updated screen option:', option);
      return await option.save();
    }

    return throwError(() => new ConflictException('Error al actualizar la opción de pantalla'));
  }

  async remove(screenId: number) {
    const option = await this.findOne(screenId);
    return await this.screenOptionModel.deleteOne({ screen_id: screenId }).exec();
  }

  async setDefault(screenId: number) {
    const option = await this.findOne(screenId);
    
    // Remover default de otras opciones del mismo servicio
    await this.screenOptionModel.updateMany(
      { serviceId: option.serviceId },
      { is_default: false }
    ).exec();

    // Establecer como default
    option.is_default = true;
    return await option.save();
  }

  async toggleActive(screenId: number) {
    const option = await this.findOne(screenId);
    option.active = !option.active;
    return await option.save();
  }

  async getStats() {
    const total = await this.screenOptionModel.countDocuments().exec();
    const active = await this.screenOptionModel.countDocuments({ active: true }).exec();
    const byService = await this.screenOptionModel.aggregate([
      { $group: { _id: '$serviceId', count: { $sum: 1 } } }
    ]).exec();

    return {
      total,
      active,
      inactive: total - active,
      by_service: byService.length
    };
  }

  async getPopularScreenCounts() {
    return await this.screenOptionModel.aggregate([
      { $group: { _id: '$screen', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).exec();
  }
}
