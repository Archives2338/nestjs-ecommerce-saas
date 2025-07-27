import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantService } from '../../tenant/tenant.service';
import { TenantManagementService } from '../../tenant/tenant-management.service';

@Injectable()
export class TenantLimitsGuard implements CanActivate {
  constructor(
    private tenantService: TenantService,
    private tenantManagementService: TenantManagementService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = this.tenantService.getTenantId();
    
    if (!tenantId) {
      return true; // Sin tenant, no hay límites
    }

    const tenant = await this.tenantManagementService.getTenantById(tenantId);
    if (!tenant) {
      throw new ForbiddenException('Tenant no encontrado');
    }

    if (!tenant.isActive) {
      throw new ForbiddenException('Tenant desactivado. Contacte soporte.');
    }

    // Verificar si la suscripción está vencida
    if (tenant.subscriptionExpiry && new Date() > tenant.subscriptionExpiry) {
      throw new ForbiddenException('Suscripción vencida. Renovar para continuar.');
    }

    const action = this.getActionFromRequest(request);
    
    switch (action) {
      case 'CREATE_PRODUCT':
        return await this.checkProductLimit(tenant);
      case 'CREATE_ORDER':
        return await this.checkOrderLimit(tenant);
      case 'CREATE_USER':
        return await this.checkUserLimit(tenant);
      default:
        return true;
    }
  }

  private getActionFromRequest(request: any): string {
    const method = request.method;
    const url = request.url;

    if (method === 'POST' && url.includes('/catalog')) {
      return 'CREATE_PRODUCT';
    }
    if (method === 'POST' && url.includes('/order')) {
      return 'CREATE_ORDER';
    }
    if (method === 'POST' && url.includes('/user')) {
      return 'CREATE_USER';
    }

    return 'UNKNOWN';
  }

  private async checkProductLimit(tenant: any): Promise<boolean> {
    // Aquí deberías consultar la base de datos para contar productos actuales
    // const currentProducts = await this.catalogService.getProductCount(tenant.tenantId);
    const currentProducts = 50; // Simulado por ahora
    
    if (currentProducts >= tenant.limits.maxProducts) {
      throw new ForbiddenException(
        `Límite de productos alcanzado (${tenant.limits.maxProducts}). Upgrade tu plan para continuar.`
      );
    }
    
    return true;
  }

  private async checkOrderLimit(tenant: any): Promise<boolean> {
    // Aquí deberías consultar las órdenes del mes actual
    const currentOrders = 100; // Simulado por ahora
    
    if (currentOrders >= tenant.limits.maxOrders) {
      throw new ForbiddenException(
        `Límite de órdenes mensuales alcanzado (${tenant.limits.maxOrders}). Upgrade tu plan para continuar.`
      );
    }
    
    return true;
  }

  private async checkUserLimit(tenant: any): Promise<boolean> {
    // Aquí deberías consultar usuarios actuales del tenant
    const currentUsers = 2; // Simulado por ahora
    
    if (currentUsers >= tenant.limits.maxUsers) {
      throw new ForbiddenException(
        `Límite de usuarios alcanzado (${tenant.limits.maxUsers}). Upgrade tu plan para continuar.`
      );
    }
    
    return true;
  }
}
