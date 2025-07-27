import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = this.tenantService.getTenantId();
    
    if (!tenantId) {
      throw new UnauthorizedException('Tenant requerido');
    }
    
    return true;
  }
}
