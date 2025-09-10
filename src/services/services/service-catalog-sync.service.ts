import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Catalog, CatalogDocument } from '../../catalog/schemas/catalog.schema';

@Injectable()
export class ServiceCatalogSyncService {
  private readonly logger = new Logger(ServiceCatalogSyncService.name);

  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
  ) {}

  /**
   * 🔄 Sincronizar servicio en todos los catálogos cuando se actualiza
   */
  async syncServiceInAllCatalogs(serviceObjectId: string, serviceData: any) {
    try {
      this.logger.log(`Syncing service ${serviceObjectId} in all catalogs`);

      let catalogsUpdated = 0;
      const updateResults = [];

      // Buscar todos los catálogos que contengan este servicio (por ObjectId o type_id)
      const catalogsWithService = await this.catalogModel.find({
        $or: [
          { 'list.spuList.serviceRef': new Types.ObjectId(serviceObjectId) },
          { 'list.spuList.id': serviceData.type_id }
        ]
      }).exec();

      for (const catalog of catalogsWithService) {
        let catalogChanged = false;
        const changes = [];

        for (const category of catalog.list) {
          for (const spu of category.spuList) {
            // Verificar si este spu corresponde al servicio actualizado
            const isTargetService = 
              spu.serviceRef?.toString() === serviceObjectId || 
              spu.id === serviceData.type_id;

            if (isTargetService) {
              const oldData = {
                name: spu.type_name,
                price: spu.min_price,
                image: spu.image
              };

              // Actualizar datos del catálogo
              spu.type_name = serviceData.name;
              spu.image = serviceData.icon || spu.image;
              spu.thumb_img = serviceData.icon || spu.thumb_img;
              spu.min_price = this.extractMinPrice(serviceData).toString();
              
              // Asegurar que tenga la referencia correcta
              if (!spu.serviceRef) {
                spu.serviceRef = new Types.ObjectId(serviceObjectId);
              }

              // Detectar cambios
              const hasChanges = 
                oldData.name !== spu.type_name ||
                oldData.price !== spu.min_price ||
                oldData.image !== spu.image;

              if (hasChanges) {
                catalogChanged = true;
                changes.push({
                  spuId: spu.id,
                  changes: {
                    name: oldData.name !== spu.type_name ? 
                      { old: oldData.name, new: spu.type_name } : null,
                    price: oldData.price !== spu.min_price ? 
                      { old: oldData.price, new: spu.min_price } : null,
                    image: oldData.image !== spu.image ? 
                      { old: oldData.image, new: spu.image } : null
                  }
                });
              }
            }
          }
        }

        // Guardar catálogo si hubo cambios
        if (catalogChanged) {
          await catalog.save();
          catalogsUpdated++;
          updateResults.push({
            language: catalog.language,
            changes: changes
          });
          this.logger.log(`Updated catalog for language: ${catalog.language}`);
        }
      }

      this.logger.log(`Service ${serviceObjectId} synced in ${catalogsUpdated} catalogs`);
      
      return {
        synced: true,
        catalogsUpdated,
        updateResults
      };

    } catch (error) {
      this.logger.error(`Error syncing service ${serviceObjectId} in catalogs:`, error);
      return {
        synced: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        catalogsUpdated: 0
      };
    }
  }

  /**
   * 🗑️ Eliminar servicio de todos los catálogos cuando se elimina
   */
  async removeServiceFromAllCatalogs(serviceTypeId: number, serviceObjectId?: string) {
    try {
      this.logger.log(`Removing service type_id ${serviceTypeId} from all catalogs`);

      let catalogsUpdated = 0;
      const removeResults = [];

      // Buscar catálogos que contengan este servicio
      const searchQuery: any = {
        'list.spuList.id': serviceTypeId
      };

      if (serviceObjectId) {
        searchQuery['$or'] = [
          { 'list.spuList.id': serviceTypeId },
          { 'list.spuList.serviceRef': new Types.ObjectId(serviceObjectId) }
        ];
      }

      const catalogsWithService = await this.catalogModel.find(searchQuery).exec();

      for (const catalog of catalogsWithService) {
        let removedCount = 0;

        for (const category of catalog.list) {
          const originalLength = category.spuList.length;
          
          // Filtrar servicios que NO sean el que queremos eliminar
          category.spuList = category.spuList.filter((spu: any) => {
            const shouldRemove = 
              spu.id === serviceTypeId || 
              (serviceObjectId && spu.serviceRef?.toString() === serviceObjectId);
            
            if (shouldRemove) {
              removedCount++;
              this.logger.log(`Removed service ${spu.type_name} from catalog ${catalog.language}`);
            }
            
            return !shouldRemove;
          });
        }

        if (removedCount > 0) {
          await catalog.save();
          catalogsUpdated++;
          removeResults.push({
            language: catalog.language,
            removedCount
          });
        }
      }

      this.logger.log(`Service type_id ${serviceTypeId} removed from ${catalogsUpdated} catalogs`);
      
      return {
        removed: true,
        catalogsUpdated,
        removeResults
      };

    } catch (error) {
      this.logger.error(`Error removing service type_id ${serviceTypeId} from catalogs:`, error);
      return {
        removed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        catalogsUpdated: 0
      };
    }
  }

  /**
   * 🔄 Sincronizar cambio de estado de servicio (activo/inactivo)
   */
  async syncServiceStatusInCatalogs(serviceTypeId: number, serviceObjectId: string, isActive: boolean) {
    try {
      this.logger.log(`Syncing service status for type_id ${serviceTypeId}: ${isActive ? 'active' : 'inactive'}`);

      if (!isActive) {
        // Si el servicio se desactiva, opcionalmente podríamos removerlo del catálogo
        // o marcarlo como inactivo. Por ahora, solo logueamos
        this.logger.log(`Service ${serviceTypeId} deactivated - catalogs may need manual review`);
        
        return {
          synced: true,
          action: 'logged_deactivation',
          catalogsUpdated: 0,
          message: 'Service deactivated - manual review recommended'
        };
      }

      // Si el servicio se reactiva, no hacemos nada automático
      // ya que podría requerir decisión manual sobre si agregarlo de nuevo
      return {
        synced: true,
        action: 'logged_activation',
        catalogsUpdated: 0,
        message: 'Service activated - manual addition to catalogs required'
      };

    } catch (error) {
      this.logger.error(`Error syncing service status:`, error);
      return {
        synced: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 📊 Obtener reporte de sincronización de un servicio
   */
  async getServiceSyncReport(serviceTypeId: number, serviceObjectId?: string) {
    try {
      const searchQuery: any = {
        'list.spuList.id': serviceTypeId
      };

      if (serviceObjectId) {
        searchQuery['$or'] = [
          { 'list.spuList.id': serviceTypeId },
          { 'list.spuList.serviceRef': new Types.ObjectId(serviceObjectId) }
        ];
      }

      const catalogsWithService = await this.catalogModel.find(searchQuery).exec();

      const report = {
        serviceTypeId,
        serviceObjectId,
        foundInCatalogs: catalogsWithService.length,
        catalogDetails: catalogsWithService.map(catalog => ({
          language: catalog.language,
          entriesFound: catalog.list.reduce((total: number, cat: any) => 
            total + cat.spuList.filter((spu: any) => 
              spu.id === serviceTypeId || 
              (serviceObjectId && spu.serviceRef?.toString() === serviceObjectId)
            ).length, 0
          ),
          hasValidRef: catalog.list.some((cat: any) => 
            cat.spuList.some((spu: any) => 
              spu.id === serviceTypeId && spu.serviceRef?.toString() === serviceObjectId
            )
          )
        }))
      };

      return report;

    } catch (error) {
      this.logger.error('Error generating service sync report:', error);
      throw error;
    }
  }

  /**
   * 💰 Extraer precio mínimo de un servicio
   */
  private extractMinPrice(service: any): number {
    try {
      if (!service || !service.plan) {
        return 0;
      }

      let minPrice = Infinity;
      
      // Buscar en plan.month
      if (service.plan.month && Array.isArray(service.plan.month)) {
        for (const monthGroup of service.plan.month) {
          if (monthGroup.screen && Array.isArray(monthGroup.screen)) {
            for (const screenPlan of monthGroup.screen) {
              if (screenPlan.sale_price) {
                const price = parseFloat(screenPlan.sale_price);
                if (!isNaN(price) && price > 0 && price < minPrice) {
                  minPrice = price;
                }
              }
            }
          }
        }
      }
      
      return minPrice === Infinity ? 0 : minPrice;
    } catch (error) {
      this.logger.warn('Error extracting min price from service:', error);
      return 0;
    }
  }
}
