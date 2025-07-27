import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog } from '../../catalog/schemas/catalog.schema';
import { User } from '../../auth/schemas/user.schema';

@Injectable()
export class UsageService {
  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<Catalog>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUsageStats(tenantId: string) {
    const [productCount, userCount] = await Promise.all([
      this.getProductCount(tenantId),
      this.getUserCount(tenantId),
    ]);

    // Para órdenes, necesitarías un modelo Order
    const orderCount = await this.getOrderCount(tenantId);

    return {
      tenantId,
      products: productCount,
      users: userCount,
      orders: orderCount,
      timestamp: new Date(),
    };
  }

  async getProductCount(tenantId: string): Promise<number> {
    return this.catalogModel.countDocuments({ tenantId });
  }

  async getUserCount(tenantId: string): Promise<number> {
    return this.userModel.countDocuments({ tenantId });
  }

  async getOrderCount(tenantId: string): Promise<number> {
    // Por ahora retornamos un valor simulado
    // En producción, tendrías un modelo Order
    return Math.floor(Math.random() * 1000);
  }

  async checkTenantLimits(tenantId: string, limits: any) {
    const usage = await this.getUsageStats(tenantId);
    
    return {
      products: {
        current: usage.products,
        limit: limits.maxProducts,
        exceeded: usage.products >= limits.maxProducts,
        percentage: Math.round((usage.products / limits.maxProducts) * 100),
      },
      users: {
        current: usage.users,
        limit: limits.maxUsers,
        exceeded: usage.users >= limits.maxUsers,
        percentage: Math.round((usage.users / limits.maxUsers) * 100),
      },
      orders: {
        current: usage.orders,
        limit: limits.maxOrders,
        exceeded: usage.orders >= limits.maxOrders,
        percentage: Math.round((usage.orders / limits.maxOrders) * 100),
      },
    };
  }

  async getNearLimitTenants(threshold = 80) {
    // Lógica para encontrar tenants cerca de sus límites
    // Útil para notificaciones automáticas de upgrade
    return [];
  }
}
