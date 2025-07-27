import { Injectable, Scope } from '@nestjs/common';

export interface TenantContext {
  tenantId: string;
  tenantData: any;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private _tenantContext: TenantContext;

  setTenantContext(context: TenantContext) {
    this._tenantContext = context;
  }

  getTenantContext(): TenantContext {
    return this._tenantContext;
  }

  getTenantId(): string {
    return this._tenantContext?.tenantId;
  }

  getTenantData(): any {
    return this._tenantContext?.tenantData;
  }
}
