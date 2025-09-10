import { Controller, Get, Post, Param, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ServiceCatalogSyncService } from '../services/service-catalog-sync.service';

@Controller('admin/sync')
export class AdminSyncController {
  private readonly logger = new Logger(AdminSyncController.name);

  constructor(
    private readonly syncService: ServiceCatalogSyncService,
  ) {}

  /**
   * 📊 Obtener reporte de sincronización de un servicio
   * GET /admin/sync/service/:serviceId/report
   */
  @Get('service/:serviceId/report')
  async getServiceSyncReport(@Param('serviceId') serviceId: string) {
    try {
      this.logger.log(`Getting sync report for service: ${serviceId}`);
      
      const report = await this.syncService.getServiceSyncReport(
        parseInt(serviceId), // Asumir que es type_id
        serviceId // También buscar por ObjectId
      );
      
      return {
        code: 0,
        message: 'Reporte de sincronización obtenido exitosamente',
        data: report
      };
    } catch (error) {
      this.logger.error('Error getting service sync report:', error);
      return {
        code: 1,
        message: 'Error al obtener reporte de sincronización',
        data: null
      };
    }
  }

  /**
   * 🔄 Sincronizar servicio manualmente en todos los catálogos
   * POST /admin/sync/service/:serviceId/sync
   */
  @Post('service/:serviceId/sync')
  @HttpCode(HttpStatus.OK)
  async manualSyncService(@Param('serviceId') serviceId: string) {
    try {
      this.logger.log(`Manual sync requested for service: ${serviceId}`);
      
      // TODO: Esto será implementado en la Fase 4 cuando integremos con ServicesService
      return {
        code: 0,
        message: 'Sincronización manual preparada',
        data: {
          serviceId,
          status: 'ready_for_integration',
          message: 'La sincronización automática será completada en la Fase 4'
        }
      };
    } catch (error) {
      this.logger.error('Error in manual sync:', error);
      return {
        code: 1,
        message: 'Error en sincronización manual',
        data: null
      };
    }
  }

  /**
   * 🗑️ Eliminar servicio de todos los catálogos
   * POST /admin/sync/service/:serviceId/remove
   */
  @Post('service/:serviceId/remove')
  @HttpCode(HttpStatus.OK)
  async removeServiceFromCatalogs(@Param('serviceId') serviceId: string) {
    try {
      this.logger.log(`Removing service ${serviceId} from all catalogs`);
      
      const result = await this.syncService.removeServiceFromAllCatalogs(
        parseInt(serviceId), // type_id
        serviceId // ObjectId
      );
      
      return {
        code: 0,
        message: `Servicio eliminado de ${result.catalogsUpdated} catálogos`,
        data: result
      };
    } catch (error) {
      this.logger.error('Error removing service from catalogs:', error);
      return {
        code: 1,
        message: 'Error al eliminar servicio de catálogos',
        data: null
      };
    }
  }
}
