import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantService, TenantContext } from './tenant.service';

export const GetTenant = createParamDecorator(
  (data: keyof TenantContext, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantService = request.tenantService as TenantService;
    
    if (!tenantService) {
      throw new Error('TenantService no está disponible. Asegúrate de que TenantMiddleware esté configurado.');
    }

    const tenantContext = tenantService.getTenantContext();
    
    if (data) {
      return tenantContext?.[data] as any;
    }
    
    return tenantContext;
  },
);

export const GetTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantService = request.tenantService as TenantService;
    return tenantService?.getTenantId();
  },
);
