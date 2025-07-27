import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../tenant/tenant.guard';
import { GetTenant } from '../tenant/tenant.decorator';
import { UsageService } from '../common/services/usage.service';
import { TenantManagementService } from '../tenant/tenant-management.service';

@Controller('usage')
@UseGuards(TenantGuard)
export class UsageController {
  constructor(
    private usageService: UsageService,
    private tenantManagementService: TenantManagementService,
  ) {}

  @Get('stats')
  async getCurrentUsage(@GetTenant('tenantId') tenantId: string) {
    const tenant = await this.tenantManagementService.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    const usage = await this.usageService.getUsageStats(tenantId);
    const limits = await this.usageService.checkTenantLimits(tenantId, tenant.limits);

    return {
      tenant: {
        id: tenant.tenantId,
        name: tenant.name,
        plan: tenant.subscriptionPlan,
        subscriptionExpiry: tenant.subscriptionExpiry,
      },
      usage,
      limits,
      recommendations: this.getRecommendations(limits, tenant.subscriptionPlan),
    };
  }

  @Get('limits')
  async getCurrentLimits(@GetTenant('tenantId') tenantId: string) {
    const tenant = await this.tenantManagementService.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    return {
      plan: tenant.subscriptionPlan,
      limits: tenant.limits,
      features: this.getPlanFeatures(tenant.subscriptionPlan),
    };
  }

  private getRecommendations(limits: any, currentPlan: string) {
    const recommendations = [];

    // Verificar si algún límite está cerca del máximo
    Object.entries(limits).forEach(([resource, data]: [string, any]) => {
      if (data.percentage > 80 && data.percentage < 100) {
        recommendations.push({
          type: 'warning',
          resource,
          message: `Estás usando el ${data.percentage}% de tu límite de ${resource}. Considera hacer upgrade.`,
        });
      } else if (data.exceeded) {
        recommendations.push({
          type: 'error',
          resource,
          message: `Has excedido tu límite de ${resource}. Upgrade requerido.`,
        });
      }
    });

    // Sugerir upgrade basado en el plan actual
    if (currentPlan === 'starter' && recommendations.length > 0) {
      recommendations.push({
        type: 'upgrade',
        message: 'Considera upgrading a Professional ($99/mes) para límites más altos.',
        suggestedPlan: 'professional',
      });
    } else if (currentPlan === 'professional' && recommendations.length > 0) {
      recommendations.push({
        type: 'upgrade',
        message: 'Considera upgrading a Enterprise ($299/mes) para límites ilimitados.',
        suggestedPlan: 'enterprise',
      });
    }

    return recommendations;
  }

  private getPlanFeatures(plan: string) {
    const features: Record<string, string[]> = {
      starter: [
        '100 productos máximo',
        '500 órdenes mensuales',
        '3 usuarios',
        'Soporte por email',
      ],
      professional: [
        '1,000 productos máximo',
        '5,000 órdenes mensuales',
        '15 usuarios',
        'Soporte prioritario',
        'Dominio personalizado',
        'Branding personalizado',
      ],
      enterprise: [
        'Productos ilimitados',
        'Órdenes ilimitadas',
        'Usuarios ilimitados',
        'Soporte dedicado',
        'API completa',
        'Webhooks ilimitados',
        'Integraciones personalizadas',
      ],
    };

    return features[plan] || [];
  }
}
