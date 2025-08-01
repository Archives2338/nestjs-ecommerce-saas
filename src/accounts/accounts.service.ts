
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceAccount } from './schemas/service-account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(ServiceAccount.name) private accountModel: Model<ServiceAccount>
  ) {}

  // Buscar perfil disponible para un servicio y perfil específico
  async findAvailableProfile(serviceId: Types.ObjectId, profileType: string) {
    return this.accountModel.findOne({
      service: serviceId,
      'profiles.status': 'disponible',
      'profiles.profileId': profileType
    });
  }

  // Asignar perfil a cliente
  async assignProfile(accountId: Types.ObjectId, profileId: string, customerId: Types.ObjectId) {
    return this.accountModel.updateOne(
      { _id: accountId, 'profiles.profileId': profileId },
      {
        $set: {
          'profiles.$.status': 'vendido',
          'profiles.$.assignedTo': customerId
        }
      }
    );
  }

  // Contar stock disponible por servicio y tipo de perfil
  async countAvailableProfiles(serviceId: Types.ObjectId, profileType: string) {
    return this.accountModel.aggregate([
      { $match: { service: serviceId } },
      { $unwind: '$profiles' },
      { $match: { 'profiles.status': 'disponible', 'profiles.profileId': profileType } },
      { $count: 'stock' }
    ]);
  }
}
