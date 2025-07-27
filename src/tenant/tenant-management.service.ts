import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from './schemas/tenant.schema';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantManagementService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
  ) {}

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Verificar que el tenantId no exista
    const existingTenant = await this.tenantModel.findOne({
      $or: [
        { tenantId: createTenantDto.tenantId },
        { email: createTenantDto.email },
        { subdomain: createTenantDto.subdomain }
      ]
    });

    if (existingTenant) {
      throw new ConflictException('Tenant ID, email o subdominio ya existe');
    }

    // Configurar valores por defecto
    const tenantData = {
      ...createTenantDto,
      settings: {
        theme: 'default',
        currency: 'USD',
        language: 'es',
        paymentMethods: ['credit_card', 'paypal'],
        shippingMethods: ['standard', 'express'],
        ...createTenantDto.settings
      },
      branding: {
        logo: '',
        colors: {
          primary: '#3B82F6',
          secondary: '#EF4444'
        },
        fonts: 'Inter',
        ...createTenantDto.branding
      },
      limits: {
        maxProducts: 1000,
        maxOrders: 10000,
        maxUsers: 100,
        ...createTenantDto.limits
      },
      subscriptionPlan: createTenantDto.subscriptionPlan || 'basic',
      subscriptionExpiry: createTenantDto.subscriptionExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    };

    const tenant = new this.tenantModel(tenantData);
    return tenant.save();
  }

  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ tenantId }).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
    }
    return tenant;
  }

  async updateTenant(tenantId: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantModel.findOneAndUpdate(
      { tenantId },
      { ...updateTenantDto },
      { new: true }
    ).exec();

    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
    }

    return tenant;
  }

  async deleteTenant(tenantId: string): Promise<void> {
    const result = await this.tenantModel.deleteOne({ tenantId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
    }
  }

  async toggleTenantStatus(tenantId: string, isActive: boolean): Promise<Tenant> {
    const tenant = await this.tenantModel.findOneAndUpdate(
      { tenantId },
      { isActive },
      { new: true }
    ).exec();

    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
    }

    return tenant;
  }

  async validateTenant(tenantId: string): Promise<boolean> {
    const tenant = await this.tenantModel.findOne({ 
      tenantId, 
      isActive: true,
      subscriptionExpiry: { $gt: new Date() }
    }).exec();
    
    return !!tenant;
  }
}
