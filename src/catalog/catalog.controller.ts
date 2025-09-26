import { Controller, Post, Body, Put, Param, Logger, HttpCode, HttpStatus, Get, Delete } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogPriceDescriptionService } from './services/catalog-price-description.service';
import { ServicesService } from '../services/services.service';
import { GetTypeClassifyListDto, UpdateCatalogDto, SpuDto } from './dto/catalog.dto';
import { UpdateServicePriceDescriptionDto } from './dto/update-service-price-description.dto';

@Controller('index')
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);
  
  constructor(
    private readonly catalogService: CatalogService,
    private readonly catalogPriceDescriptionService: CatalogPriceDescriptionService,
    private readonly servicesService: ServicesService
  ) {}

  @Post('getTypeClassifyList')
  @HttpCode(HttpStatus.OK)
  async getTypeClassifyList(
    @Body() getTypeClassifyListDto: GetTypeClassifyListDto
  ) {
    try {
      this.logger.log(`Getting catalog for language: ${getTypeClassifyListDto.language}`);
      const result = await this.catalogService.getTypeClassifyList(getTypeClassifyListDto);
      this.logger.log('Catalog retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error('Error getting catalog:', error);
      throw error;
    }
  }

  @Put('catalog/:language')
  async updateCatalog(
    @Param('language') language: string,
    @Body() updateCatalogDto: UpdateCatalogDto
  ) {
    try {
      this.logger.log(`Updating catalog for language: ${language}`);
      const result = await this.catalogService.updateCatalog(language, updateCatalogDto);
      this.logger.log('Catalog updated successfully');
      return result;
    } catch (error) {
      this.logger.error('Error updating catalog:', error);
      throw error;
    }
  }

  // @Post('addRecentOrder/:productId')
  // @HttpCode(HttpStatus.OK)
  // async addRecentOrder(
  //   @Param('productId') productId: number,
  //   @Body() orderData: any
  // ) {
  //   try {
  //     this.logger.log(`Adding recent order for product: ${productId}`);
  //     await this.catalogService.addRecentOrder(productId, orderData);
  //     this.logger.log('Recent order added successfully');
  //     return {
  //       code: 0,
  //       message: 'Orden reciente agregada exitosamente',
  //       toast: 0,
  //       redirect_url: '',
  //       type: 'success'
  //     };
  //   } catch (error) {
  //     this.logger.error('Error adding recent order:', error);
  //     throw error;
  //   }
  // }

 // unlock service for catalog

  @Put('catalog/:serviceId/unlock')
  async unlockServiceForCatalog(
    @Param('serviceId') serviceId: string
  ) {
    try {
      const result = await this.catalogService.unlockServiceForCatalog(serviceId);
      this.logger.log('Service unlocked successfully');
      return result;
    } catch (error) {
      this.logger.error('Error unlocking service:', error);
      throw error;
    }
  }

  //lock service for catalog
  
  @Put('catalog/:serviceId/lock')
  async lockServiceForCatalog(
    @Param('serviceId') serviceId: string
  ) {
    try {
      const result = await this.catalogService.lockServiceForCatalog(serviceId);
      this.logger.log('Service locked successfully');
      return result;
    } catch (error) {
      this.logger.error('Error locking service:', error);
      throw error;
    }
  }

  @Put('catalog/service/:language/:serviceId/price-description')
  async updateServicePriceAndDescription(
    @Param('language') language: string,
    @Param('serviceId') serviceId: string,
    @Body() updateData: UpdateServicePriceDescriptionDto
  ) {
    try {
      this.logger.log(`Updating service ${serviceId} price and description for language: ${language}`);
      console.log(`Data received:`, JSON.stringify({
        min_price: updateData.min_price,
        description: updateData.description,
        description_short: updateData.description_short
      }, null, 2));
      
      const result = await this.catalogPriceDescriptionService.updateServicePriceAndDescription(
        language,
        serviceId,
        updateData.min_price,
        updateData.description,
        updateData.description_short,
        updateData.show_price 
      );
      this.logger.log('Service price and description updated successfully');
      return result;
    } catch (error) {
      this.logger.error('Error updating service price and description:', error);
      throw error;
    }
  }

  @Post('catalog/:language/add-service')
  @HttpCode(HttpStatus.CREATED)
  async addServiceToCatalog(
    @Param('language') language: string,
    @Body() requestData: { serviceId: string; categoryId?: number }
  ) {
    try {
      this.logger.log(`Adding service ${requestData.serviceId} to catalog for language: ${language}`);
      
      // 1. Validar que el servicio existe primero usando el modelo directamente
      let serviceExists;
      try {
        serviceExists = await this.servicesService.getServiceByIdForCatalog(requestData.serviceId);
      } catch (error) {
        return {
          code: 1,
          message: 'El servicio especificado no existe',
          toast: 1,
          type: 'error',
          data: null
        };
      }

      // 2. Extraer precio mínimo del servicio
      const minPrice = this.extractMinPrice(serviceExists);

      // 3. Mapear datos del servicio real al formato de catálogo (ObjectId)
      const catalogServiceData = {
        serviceId: requestData.serviceId, // 🎯 ObjectId del servicio (principal)
        type_id: serviceExists.type_id, // 📋 Mantenido para compatibilidad temporal
        type_name: serviceExists.name,
        detail_route: `/services/${serviceExists.type_id}`,
        is_netflix: serviceExists.name.toLowerCase().includes('netflix'),
        image: serviceExists.icon || 'https://via.placeholder.com/150',
        image_type: 0,
        thumb_img: serviceExists.icon || 'https://via.placeholder.com/150',
        min_price: minPrice,
        currency_icon1: '$',
        currency_icon2: 'USD($)',
        currency_show_type: 1,
        vip_status: 0,
        lock_status: 1,
        rank: 0,
        recent_order: [],
        description: [],
        prompt: []
      };

      // 4. Agregar al catálogo
      const result = await this.catalogService.addServiceToCatalog(language, catalogServiceData);
      this.logger.log('Service added to catalog successfully');
      
      return {
        code: 0,
        message: 'Servicio agregado exitosamente al catálogo',
        toast: 0,
        type: 'success',
        data: {
          catalogEntry: catalogServiceData,
          originalService: {
            id: serviceExists._id,
            type_id: serviceExists.type_id,
            name: serviceExists.name
          }
        }
      };

    } catch (error) {
      this.logger.error('Error adding service to catalog:', error);
      return {
        code: 1,
        message: 'Error al agregar servicio al catálogo',
        toast: 1,
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Extrae el precio mínimo de un servicio
   */
  private extractMinPrice(service: any): string {
    try {
      // Buscar en plan.month
      if (service.plan?.month?.length > 0) {
        for (const monthPlan of service.plan.month) {
          if (monthPlan.screen?.length > 0) {
            const minScreenPrice = Math.min(...monthPlan.screen.map((s: any) => parseFloat(s.sale_price || s.original_price || '0')));
            if (minScreenPrice > 0) {
              return minScreenPrice.toFixed(2);
            }
          }
        }
      }

      // Buscar en plan.screen
      if (service.plan?.screen?.length > 0) {
        for (const screenPlan of service.plan.screen) {
          if (screenPlan.month?.length > 0) {
            const minMonthPrice = Math.min(...screenPlan.month.map((m: any) => parseFloat(m.sale_price || m.original_price || '0')));
            if (minMonthPrice > 0) {
              return minMonthPrice.toFixed(2);
            }
          }
        }
      }

      return '0.00';
    } catch (error) {
      this.logger.warn('Error extracting min price, using default:', error);
      return '0.00';
    }
  }

  // ==================== 🔍 ENDPOINTS DE VALIDACIÓN E INTEGRIDAD ====================

  /**
   * 🔍 Validar integridad del catálogo
   * GET /index/catalog/:language/validate-integrity
   */
  @Get('catalog/:language/validate-integrity')
  async validateCatalogIntegrity(@Param('language') language: string) {
    try {
      this.logger.log(`Validating catalog integrity for language: ${language}`);
      
      const result = await this.catalogService.validateIntegrity(language);
      
      return {
        code: 0,
        message: result.issues.length === 0 ? 'Catálogo íntegro' : `${result.issues.length} problemas encontrados`,
        data: result
      };
    } catch (error) {
      this.logger.error('Error validating catalog integrity:', error);
      return {
        code: 1,
        message: 'Error al validar integridad del catálogo',
        data: null
      };
    }
  }

  /**
   * 🔄 Sincronizar todos los servicios del catálogo
   * POST /index/catalog/:language/sync-all
   */
  @Post('catalog/:language/sync-all')
  @HttpCode(HttpStatus.OK)
  async syncAllCatalogServices(@Param('language') language: string) {
    try {
      this.logger.log(`Syncing all catalog services for language: ${language}`);
      
      const result = await this.catalogService.syncAllServices(language);
      
      return {
        code: 0,
        message: `Sincronización completada. ${result.updated} servicios actualizados.`,
        data: result
      };
    } catch (error) {
      this.logger.error('Error syncing catalog services:', error);
      return {
        code: 1,
        message: 'Error al sincronizar servicios del catálogo',
        data: null
      };
    }
  }

  /**
   * 🗑️ Limpiar servicios huérfanos del catálogo
   * DELETE /index/catalog/:language/orphaned-services
   */
  @Delete('catalog/:language/orphaned-services')
  async removeOrphanedServices(@Param('language') language: string) {
    try {
      this.logger.log(`Removing orphaned services for language: ${language}`);
      
      const result = await this.catalogService.removeOrphanedServices(language);
      
      return {
        code: 0,
        message: `${result.removed} servicios huérfanos eliminados`,
        data: result
      };
    } catch (error) {
      this.logger.error('Error removing orphaned services:', error);
      return {
        code: 1,
        message: 'Error al eliminar servicios huérfanos',
        data: null
      };
    }
  }

  /**
   * 🧹 Realizar limpieza completa del catálogo (sync + cleanup + validación)
   * POST /index/catalog/:language/full-cleanup
   */
  @Post('catalog/:language/full-cleanup')
  @HttpCode(HttpStatus.OK)
  async performFullCatalogCleanup(@Param('language') language: string) {
    try {
      this.logger.log(`Performing full catalog cleanup for language: ${language}`);
      
      const result = await this.catalogService.performFullCatalogCleanup(language);
      
      return {
        code: 0,
        message: result.message,
        data: result
      };
    } catch (error) {
      this.logger.error('Error performing full catalog cleanup:', error);
      return {
        code: 1,
        message: 'Error al realizar limpieza completa del catálogo',
        data: null
      };
    }
  }

  /**
   * 📊 Obtener estadísticas del catálogo
   * GET /index/catalog/:language/stats
   */
  @Get('catalog/:language/stats')
  async getCatalogStats(@Param('language') language: string) {
    try {
      this.logger.log(`Getting catalog stats for language: ${language}`);
      
      const result = await this.catalogService.getCatalogStats(language);
      
      return {
        code: 0,
        message: 'Estadísticas obtenidas exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error('Error getting catalog stats:', error);
      return {
        code: 1,
        message: 'Error al obtener estadísticas del catálogo',
        data: null
      };
    }
  }

  // ==================== 🔄 ENDPOINTS DE SINCRONIZACIÓN MANUAL ====================

  /**
   * 🔄 Sincronizar un servicio específico en todos los catálogos
   * POST /index/catalog/sync-service/:serviceId
   */
  @Post('catalog/sync-service/:serviceId')
  @HttpCode(HttpStatus.OK)
  async syncSpecificService(@Param('serviceId') serviceId: string) {
    try {
      this.logger.log(`Manual sync requested for service: ${serviceId}`);
      
      // Obtener datos del servicio
      const serviceData = await this.servicesService.getServiceByIdForCatalog(serviceId);
      
      // Realizar sincronización (esto será implementado cuando integremos el ServiceCatalogSyncService)
      // Por ahora, solo validamos que el servicio existe
      
      return {
        code: 0,
        message: 'Servicio encontrado y listo para sincronización',
        data: {
          serviceId,
          serviceName: serviceData.name,
          typeId: serviceData.type_id,
          message: 'Sincronización automática será implementada en integración con ServicesService'
        }
      };
    } catch (error) {
      this.logger.error('Error syncing specific service:', error);
      return {
        code: 1,
        message: 'Error al sincronizar servicio específico',
        data: null
      };
    }
  }

  // ==================== 🎯 ENDPOINTS OBJECTID (NUEVA VERSIÓN) ====================

  /**
   * 🔍 Validar integridad del catálogo usando ObjectId
   * GET /index/catalog/:language/validate-integrity-objectid
   */
  @Get('catalog/:language/validate-integrity-objectid')
  async validateCatalogIntegrityWithObjectId(@Param('language') language: string) {
    try {
      this.logger.log(`Validating catalog integrity with ObjectId for language: ${language}`);
      
      const result = await this.catalogService.validateIntegrityWithObjectId(language);
      
      return {
        code: 0,
        message: result.issues.length === 0 ? 'Catálogo íntegro (ObjectId)' : `${result.issues.length} problemas encontrados`,
        data: result
      };
    } catch (error) {
      this.logger.error('Error validating catalog integrity with ObjectId:', error);
      return {
        code: 1,
        message: 'Error al validar integridad del catálogo (ObjectId)',
        data: null
      };
    }
  }

  /**
   * 🗑️ Limpiar servicios huérfanos usando ObjectId
   * DELETE /index/catalog/:language/orphaned-services-objectid
   */
  @Delete('catalog/:language/orphaned-services-objectid')
  async removeOrphanedServicesWithObjectId(@Param('language') language: string) {
    try {
      this.logger.log(`Removing orphaned services with ObjectId for language: ${language}`);
      
      const result = await this.catalogService.removeOrphanedServicesWithObjectId(language);
      
      return {
        code: 0,
        message: `${result.removed} servicios huérfanos eliminados (ObjectId)`,
        data: result
      };
    } catch (error) {
      this.logger.error('Error removing orphaned services with ObjectId:', error);
      return {
        code: 1,
        message: 'Error al eliminar servicios huérfanos (ObjectId)',
        data: null
      };
    }
  }

  /**
   * 📊 Obtener estadísticas de migración ObjectId vs type_id
   * GET /index/catalog/:language/migration-stats
   */
  @Get('catalog/:language/migration-stats')
  async getCatalogMigrationStats(@Param('language') language: string) {
    try {
      this.logger.log(`Getting migration stats for language: ${language}`);
      
      const result = await this.catalogService.validateObjectIdMigration(language);
      
      return {
        code: 0,
        message: result.isFullyMigrated ? 
          'Sistema completamente migrado a ObjectId' : 
          `Migración ${result.migrationPercentage}% completa`,
        data: result
      };
    } catch (error) {
      this.logger.error('Error getting migration stats:', error);
      return {
        code: 1,
        message: 'Error al obtener estadísticas de migración',
        data: null
      };
    }
  }
}
