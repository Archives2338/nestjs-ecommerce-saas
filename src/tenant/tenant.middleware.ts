import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

// Extender la interfaz Request para incluir tenantService
declare global {
  namespace Express {
    interface Request {
      tenantService?: TenantService;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Obtener tenant desde el subdominio, header o parámetro
    let tenantId = this.extractTenantFromRequest(req);
    
    if (!tenantId) {
      tenantId = 'default'; // Tenant por defecto
    }

    // Aquí podrías validar si el tenant existe en la base de datos
    const tenantData = await this.validateAndGetTenantData(tenantId);

    this.tenantService.setTenantContext({
      tenantId,
      tenantData
    });

    // Agregar el tenantService al request para que esté disponible en los decorators
    req.tenantService = this.tenantService;

    next();
  }

  private extractTenantFromRequest(req: Request): string | null {
    // Opción 1: Desde subdominio (empresa1.tuecommerce.com)
    const host = req.get('host');
    if (host && host.includes('.')) {
      const subdomain = host.split('.')[0];
      if (subdomain !== 'www' && subdomain !== 'api') {
        return subdomain;
      }
    }

    // Opción 2: Desde header personalizado
    const tenantHeader = req.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      return tenantHeader;
    }

    // Opción 3: Desde parámetro de query
    const tenantQuery = req.query.tenant as string;
    if (tenantQuery) {
      return tenantQuery;
    }

    return null;
  }

  private async validateAndGetTenantData(tenantId: string): Promise<any> {
    // Por ahora retornamos datos mock, pero aquí podrías consultar la base de datos
    try {
      // En producción, aquí harías: 
      // const tenant = await this.tenantManagementService.getTenantById(tenantId);
      // return tenant;
      
      return {
        name: `Empresa ${tenantId}`,
        theme: 'default',
        settings: {
          currency: 'USD',
          language: 'es'
        }
      };
    } catch (error) {
      // Si el tenant no existe, usar configuración por defecto
      return {
        name: 'Default Company',
        theme: 'default',
        settings: {
          currency: 'USD',
          language: 'es'
        }
      };
    }
  }
}
