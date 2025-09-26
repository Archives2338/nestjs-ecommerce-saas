import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog, CatalogDocument } from './schemas/catalog.schema';
import { GetTypeClassifyListDto, UpdateCatalogDto, SpuDto } from './dto/catalog.dto';
import { ServicesService } from '../services/services.service';
import { MockDataLoader } from '../utils/mock-data-loader';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
    private readonly servicesService: ServicesService,
  ) {}

  async getTypeClassifyList(getTypeClassifyListDto: GetTypeClassifyListDto) {
    try {
      const language = getTypeClassifyListDto.language || 'es';
      
      this.logger.log(`Getting type classify list for language: ${language}`);
      
      let catalog = await this.catalogModel.findOne({ language }).exec();
      
      if (!catalog) {
        this.logger.log(`Catalog not found for language: ${language}, creating default`);
        const defaultCatalogResult = await this.createDefaultCatalog(language);
        
        // Verificar si createDefaultCatalog devuelve un objeto con data o directamente el catálogo
        if (defaultCatalogResult && defaultCatalogResult.data) {
          return defaultCatalogResult;
        } else {
          catalog = defaultCatalogResult as any;
        }
      }
      
      if (!catalog) {
        throw new Error('Could not get or create catalog');
      }
      
      const result = {
        code: 0,
        data: {
          classify_tab: catalog.classify_tab,
          statistics: catalog.statistics,
          list: catalog.list,
          language: catalog.language,
          promote: catalog.promote
        }
      };
      
      this.logger.log(`Successfully retrieved catalog with ${catalog.list.length} categories`);
      return result;
      
    } catch (error) {
      this.logger.error('Error getting type classify list:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtener catálogo por idioma (método auxiliar)
   */
  async getCatalogByLanguage(language: string) {
    return await this.catalogModel.findOne({ language }).exec();
  }

  /**
   * 🔍 Validar que todo el sistema use ObjectId en lugar de type_id
   */
  async validateObjectIdMigration(language: string) {
    try {
      this.logger.log(`Validating ObjectId migration for language: ${language}`);
      
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catalog not found for language: ${language}`);
      }

      let totalServices = 0;
      let servicesWithObjectId = 0;
      let servicesWithTypeIdOnly = 0;
      let validObjectIdReferences = 0;
      const issues = [];
      const servicesDetails = [];

      for (const category of catalog.list) {
        for (const spu of category.spuList) {
          totalServices++;
          const hasServiceId = !!spu.serviceId;
          const hasTypeId = !!(spu.type_id || spu.id);
          
          if (hasServiceId) {
            servicesWithObjectId++;
            
            // Validar que la referencia ObjectId sea válida
            try {
              const realService = await this.servicesService.getServiceByIdForCatalog(spu.serviceId.toString());
              validObjectIdReferences++;
              
              servicesDetails.push({
                name: spu.type_name,
                serviceId: spu.serviceId.toString(),
                type_id: spu.type_id || null,
                status: 'VALID_OBJECTID',
                realServiceName: realService.name || realService.type_name,
                categoryId: category.id
              });
              
            } catch (error) {
              issues.push({
                type: 'invalid_objectid',
                serviceName: spu.type_name,
                serviceId: spu.serviceId.toString(),
                categoryId: category.id,
                message: `ObjectId ${spu.serviceId} no corresponde a un servicio real`
              });
              
              servicesDetails.push({
                name: spu.type_name,
                serviceId: spu.serviceId.toString(),
                type_id: spu.type_id || null,
                status: 'INVALID_OBJECTID',
                categoryId: category.id
              });
            }
          } else if (hasTypeId) {
            servicesWithTypeIdOnly++;
            issues.push({
              type: 'missing_objectid',
              serviceName: spu.type_name,
              type_id: spu.type_id || spu.id,
              categoryId: category.id,
              message: `Servicio '${spu.type_name}' aún usa type_id sin serviceId`
            });
            
            servicesDetails.push({
              name: spu.type_name,
              serviceId: null,
              type_id: spu.type_id || spu.id,
              status: 'LEGACY_TYPEID',
              categoryId: category.id
            });
          } else {
            issues.push({
              type: 'no_identifier',
              serviceName: spu.type_name,
              categoryId: category.id,
              message: `Servicio '${spu.type_name}' no tiene identificador`
            });
            
            servicesDetails.push({
              name: spu.type_name,
              serviceId: null,
              type_id: null,
              status: 'NO_IDENTIFIER',
              categoryId: category.id
            });
          }
        }
      }

      const migrationPercentage = totalServices > 0 ? 
        (servicesWithObjectId / totalServices * 100) : 100;
      
      const validityPercentage = servicesWithObjectId > 0 ? 
        (validObjectIdReferences / servicesWithObjectId * 100) : 100;

      return {
        isFullyMigrated: servicesWithTypeIdOnly === 0 && issues.length === 0,
        isObjectIdValid: validObjectIdReferences === servicesWithObjectId,
        totalServices,
        servicesWithObjectId,
        servicesWithTypeIdOnly,
        validObjectIdReferences,
        migrationPercentage: parseFloat(migrationPercentage.toFixed(1)),
        validityPercentage: parseFloat(validityPercentage.toFixed(1)),
        issues,
        servicesDetails,
        summary: {
          status: servicesWithTypeIdOnly === 0 && issues.length === 0 ? 
            'FULLY_MIGRATED' : 
            (servicesWithObjectId > 0 ? 'PARTIALLY_MIGRATED' : 'NOT_MIGRATED'),
          message: servicesWithTypeIdOnly === 0 && issues.length === 0 ?
            'Sistema completamente migrado a ObjectId' :
            `${issues.length} problemas encontrados en migración ObjectId`
        }
      };

    } catch (error) {
      this.logger.error('Error validating ObjectId migration:', error);
      throw error;
    }
  }

  // ==================== � MÉTODOS AUXILIARES ====================

  async updateCatalog(language: string, updateData: UpdateCatalogDto) {
    try {
      const updatedCatalog = await this.catalogModel.findOneAndUpdate(
        { language },
        updateData,
        { new: true, upsert: true }
      ).exec();

      return {
        code: 0,
        message: 'Catálogo actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: updatedCatalog
      };
    } catch (error) {
      this.logger.error('Error updating catalog:', error);
      return {
        code: 1,
        message: 'Error al actualizar catálogo',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  async addRecentOrder(productId: number, orderData: any) {
    try {
      this.logger.log(`Adding recent order for product: ${productId}`);
      
      // Buscar el catálogo y actualizar las órdenes recientes del producto específico
      const catalog = await this.catalogModel.findOne().exec();
      
      if (catalog) {
        // Buscar el producto en todas las categorías
        for (const category of catalog.list) {
          const product = category.spuList.find((spu: any) => spu.id === productId);
          if (product) {
            // Agregar la nueva orden al principio del array
            product.recent_order.unshift(orderData);
            // Mantener solo las últimas 10 órdenes
            if (product.recent_order.length > 10) {
              product.recent_order = product.recent_order.slice(0, 10);
            }
            break;
          }
        }
        
        await catalog.save();
        this.logger.log('Recent order added successfully');
      }
    } catch (error) {
      this.logger.error('Error adding recent order:', error);
    }
  }

  async addServiceToCatalog(language: string, newServiceData: SpuDto) {
    try {
      this.logger.log(`Adding new service to catalog for language: ${language}`);

      const catalog = await this.catalogModel.findOne({ language }).exec();

      if (!catalog) {
        throw new Error('Catalog not found');
      }

      // Si se proporciona serviceId, validar que el servicio existe
      if (newServiceData.serviceId) {
        try {
          await this.servicesService.getServiceByIdForCatalog(newServiceData.serviceId);
        } catch (error) {
          throw new Error(`Service with ID ${newServiceData.serviceId} not found`);
        }
      }

      // Agregar el nuevo servicio al spuList de la primera categoría
      catalog.list[0].spuList.push(newServiceData);

      // Guardar los cambios en la base de datos
      await catalog.save();

      return {
        code: 0,
        message: 'Servicio agregado exitosamente',
        data: newServiceData,
      };
    } catch (error) {
      this.logger.error('Error adding new service to catalog:', error);
      throw error;
    }
  }

  // ==================== 🔍 MÉTODOS DE VALIDACIÓN E INTEGRIDAD ====================

  /**
   * 🔍 Validar integridad del catálogo usando ObjectId (NUEVA VERSIÓN)
   */
  async validateIntegrityWithObjectId(language: string) {
    try {
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catalog not found for language: ${language}`);
      }

      const issues = [];
      const validServices = [];
      const orphanedServices = [];

      // Verificar cada servicio en el catálogo
      for (const category of catalog.list) {
        for (const spu of category.spuList) {
          try {
            let serviceExists = false;
            let realService = null;

            // Usar serviceId (ObjectId) como identificador principal
            if (spu.serviceId) {
              try {
                realService = await this.servicesService.getServiceByIdForCatalog(spu.serviceId.toString());
                serviceExists = true;
                validServices.push({
                  catalogServiceId: spu.serviceId,
                  name: spu.type_name,
                  categoryId: category.id
                });
              } catch (error) {
                this.logger.error(`Service with ObjectId ${spu.serviceId} not found:`, error);
                serviceExists = false;
              }
            } else {
              // Si no tiene serviceId, es un problema
              issues.push({
                type: 'missing_service_id',
                catalogService: spu.type_name,
                message: `Servicio '${spu.type_name}' no tiene serviceId (ObjectId)`
              });
            }

            if (!serviceExists) {
              orphanedServices.push({
                serviceId: spu.serviceId || null,
                type_id: spu.type_id || null,
                name: spu.type_name,
                categoryId: category.id,
                reason: spu.serviceId ? 
                  'Service with ObjectId not found' : 
                  'Missing serviceId'
              });
              
              issues.push({
                type: 'orphaned',
                catalogService: spu.type_name,
                serviceId: spu.serviceId || null,
                message: `Servicio '${spu.type_name}' no existe en la base de datos`
              });
            }

          } catch (error) {
            this.logger.error(`Error validating service ${spu.type_name}:`, error);
            issues.push({
              type: 'error',
              catalogService: spu.type_name,
              serviceId: spu.serviceId || null,
              message: `Error al validar servicio: ${error instanceof Error ? error.message : 'Error desconocido'}`
            });
          }
        }
      }

      return {
        isValid: issues.length === 0,
        totalServices: catalog.list.reduce((total, cat) => total + cat.spuList.length, 0),
        validServices: validServices.length,
        issues: issues,
        summary: {
          orphaned: orphanedServices.length,
          missing_service_ids: issues.filter(i => i.type === 'missing_service_id').length,
          errors: issues.filter(i => i.type === 'error').length
        },
        details: {
          orphanedServices
        }
      };

    } catch (error) {
      this.logger.error('Error validating catalog integrity with ObjectId:', error);
      throw error;
    }
  }

  /**
   * 🔍 Validar integridad del catálogo (VERSIÓN LEGACY con type_id)
   */
  async validateIntegrity(language: string) {
    try {
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catalog not found for language: ${language}`);
      }

      const issues = [];
      const validServices = [];
      const orphanedServices = [];
      const outdatedServices = [];

      // Verificar cada servicio en el catálogo
      for (const category of catalog.list) {
        for (const spu of category.spuList) {
          try {
            let realService = null;
            
            // Intentar buscar por serviceRef primero, luego por type_id
            if (spu.serviceRef) {
              try {
                realService = await this.servicesService.getServiceByIdForCatalog(spu.serviceRef.toString());
              } catch (error) {
                // Si no se encuentra por ObjectId, intentar por type_id
                realService = null;
              }
            }
            
            // Si no se encontró por ObjectId, buscar por type_id
            if (!realService) {
              try {
                // Buscar servicio específico por type_id y language
                const serviceByServiceId = await this.servicesService.getSkuList({
                  language,
                  serviceId: spu.id,
                  source: 1
                });

                if (serviceByServiceId && serviceByServiceId.code === 0 && serviceByServiceId.data) {
                  // Obtener el servicio completo por ObjectId
                  realService = await this.servicesService.getServiceByIdForCatalog(serviceByServiceId.data._id);
                }
              } catch (error) {
                this.logger.error(`Error searching service by serviceId ${spu.id}:`, error);
                realService = null;
              }
            }
            
            if (!realService) {
              // Servicio huérfano
              orphanedServices.push({
                catalogId: spu.id,
                serviceName: spu.type_name,
                categoryId: category.id,
                issue: 'Service not found in services collection'
              });
              issues.push({
                type: 'orphaned',
                catalogId: spu.id,
                message: `Servicio '${spu.type_name}' no existe en la colección de servicios`
              });
            } else {
              validServices.push(spu.id);
              
              // Verificar si los datos están desactualizados
              const catalogPrice = parseFloat(spu.min_price || '0');
              const realMinPrice = this.extractMinPrice(realService);
              
              if (Math.abs(catalogPrice - realMinPrice) > 0.01) {
                outdatedServices.push({
                  catalogId: spu.id,
                  serviceName: spu.type_name,
                  catalogPrice: catalogPrice,
                  realPrice: realMinPrice,
                  issue: 'Price mismatch'
                });
                issues.push({
                  type: 'outdated_price',
                  catalogId: spu.id,
                  message: `Precio desactualizado: catálogo ${catalogPrice}, real ${realMinPrice}`
                });
              }
              
              if (spu.type_name !== realService.name) {
                issues.push({
                  type: 'outdated_name',
                  catalogId: spu.id,
                  message: `Nombre desactualizado: catálogo '${spu.type_name}', real '${realService.name}'`
                });
              }

              // Verificar si falta la referencia serviceRef
              if (!spu.serviceRef) {
                issues.push({
                  type: 'missing_ref',
                  catalogId: spu.id,
                  message: `Falta referencia serviceRef para el servicio '${spu.type_name}'`
                });
              }
            }
          } catch (error) {
            this.logger.error(`Error validating service ${spu.id}:`, error);
            issues.push({
              type: 'error',
              catalogId: spu.id,
              message: `Error al validar servicio: ${error instanceof Error ? error.message : 'Error desconocido'}`
            });
          }
        }
      }

      return {
        isValid: issues.length === 0,
        totalServices: catalog.list.reduce((total, cat) => total + cat.spuList.length, 0),
        validServices: validServices.length,
        issues: issues,
        summary: {
          orphaned: orphanedServices.length,
          outdated: outdatedServices.length,
          missing_refs: issues.filter(i => i.type === 'missing_ref').length,
          errors: issues.filter(i => i.type === 'error').length
        },
        details: {
          orphanedServices,
          outdatedServices
        }
      };

    } catch (error) {
      this.logger.error('Error validating catalog integrity:', error);
      throw error;
    }
  }

  /**
   * 🔄 Sincronizar todos los servicios del catálogo
   */
  async syncAllServices(language: string) {
    try {
      this.logger.log(`Starting sync for catalog language: ${language}`);
      
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catalog not found for language: ${language}`);
      }

      let updated = 0;
      let errors = 0;
      const updateDetails = [];

      for (const category of catalog.list) {
        for (const spu of category.spuList) {
          try {
            let realService = null;
            let serviceObjectId = null;

            // Intentar buscar por serviceRef primero
            if (spu.serviceRef) {
              try {
                realService = await this.servicesService.getServiceByIdForCatalog(spu.serviceRef.toString());
                serviceObjectId = spu.serviceRef.toString();
              } catch (error) {
                this.logger.warn(`ServiceRef ${spu.serviceRef} not found, searching by type_id`);
              }
            }

            // Si no se encontró por ObjectId, buscar por type_id
            if (!realService) {
              try {
                // Buscar servicio específico por type_id y language usando getSkuList
                const serviceByServiceId = await this.servicesService.getSkuList({
                  language,
                  serviceId: spu.id,
                  source: 1
                });

                if (serviceByServiceId && serviceByServiceId.code === 0 && serviceByServiceId.data) {
                  // Obtener el servicio completo por ObjectId
                  realService = await this.servicesService.getServiceByIdForCatalog(serviceByServiceId.data._id);
                  serviceObjectId = serviceByServiceId.data._id;
                }
              } catch (error) {
                this.logger.error(`Error searching service by serviceId ${spu.id}:`, error);
                realService = null;
              }
            }

            if (realService) {
              const oldData = {
                price: spu.min_price,
                name: spu.type_name,
                image: spu.image,
                serviceRef: spu.serviceRef
              };

              // Actualizar datos del catálogo con datos reales
              const newMinPrice = this.extractMinPrice(realService).toString();
              spu.type_name = realService.name;
              spu.image = realService.icon || spu.image;
              spu.thumb_img = realService.icon || spu.thumb_img;
              spu.min_price = newMinPrice;
              
              // Actualizar serviceRef si no existe o es diferente
              if (!spu.serviceRef && serviceObjectId) {
                spu.serviceRef = serviceObjectId;
              }

              // Verificar si hubo cambios
              const hasChanges = 
                oldData.price !== spu.min_price || 
                oldData.name !== spu.type_name ||
                oldData.image !== spu.image ||
                !oldData.serviceRef;

              if (hasChanges) {
                updated++;
                updateDetails.push({
                  id: spu.id,
                  name: spu.type_name,
                  changes: {
                    price: oldData.price !== spu.min_price ? 
                      { old: oldData.price, new: spu.min_price } : null,
                    name: oldData.name !== spu.type_name ? 
                      { old: oldData.name, new: spu.type_name } : null,
                    image: oldData.image !== spu.image ? 
                      { old: oldData.image, new: spu.image } : null,
                    serviceRef: !oldData.serviceRef ? 
                      { old: null, new: serviceObjectId } : null
                  }
                });
              }
            } else {
              // Servicio no encontrado, será manejado por removeOrphanedServices
              this.logger.warn(`Service not found for catalog entry ${spu.id} - ${spu.type_name}`);
              errors++;
            }
          } catch (error) {
            this.logger.error(`Error syncing service ${spu.id}:`, error);
            errors++;
          }
        }
      }

      // Guardar cambios
      if (updated > 0) {
        await catalog.save();
        this.logger.log(`Catalog sync completed: ${updated} services updated`);
      }

      return {
        updated,
        errors,
        totalProcessed: catalog.list.reduce((total, cat) => total + cat.spuList.length, 0),
        updateDetails,
        message: updated > 0 ? 
          `Sincronización exitosa: ${updated} servicios actualizados` : 
          'No se requirieron actualizaciones'
      };

    } catch (error) {
      this.logger.error('Error syncing all catalog services:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Eliminar servicios huérfanos del catálogo
   */
  async removeOrphanedServices(language: string) {
    try {
      this.logger.log(`Starting orphaned services removal for language: ${language}`);
      
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catalog not found for language: ${language}`);
      }

      let removed = 0;
      const removedServices = [];
      let totalOriginal = 0;

      for (const category of catalog.list) {
        const originalCount = category.spuList.length;
        totalOriginal += originalCount;
        const validSpuList = [];
        
        for (const spu of category.spuList) {
          let serviceExists = false;
          
          try {
            // Intentar buscar por serviceRef primero
            if (spu.serviceRef) {
              try {
                await this.servicesService.getServiceByIdForCatalog(spu.serviceRef.toString());
                serviceExists = true;
              } catch (error) {
                // Si no se encuentra por ObjectId, intentar por type_id
                serviceExists = false;
              }
            }
            
            // Si no se encontró por ObjectId, buscar por type_id
            if (!serviceExists) {
              try {
                // Buscar servicio específico por type_id y language usando getSkuList
                const serviceByTypeId = await this.servicesService.getSkuList({
                  language,
                  serviceId: spu.id,
                  source: 1
                });
                
                if (serviceByTypeId && serviceByTypeId.code === 0 && serviceByTypeId.data) {
                  // Verificar que realmente existe obteniendo el servicio completo
                  await this.servicesService.getServiceByIdForCatalog(serviceByTypeId.data._id);
                  serviceExists = true;
                  
                  // Actualizar serviceRef si no existía
                  if (!spu.serviceRef) {
                    spu.serviceRef = serviceByTypeId.data._id;
                  }
                }
              } catch (error) {
                this.logger.error(`Service with type_id ${spu.id} not found:`, error);
                serviceExists = false;
              }
            }
            
            if (serviceExists) {
              validSpuList.push(spu);
            } else {
              removed++;
              removedServices.push({
                id: spu.id,
                name: spu.type_name,
                categoryId: category.id,
                serviceRef: spu.serviceRef || null,
                reason: spu.serviceRef ? 
                  'Service with ObjectId not found' : 
                  'Service with type_id not found'
              });
              this.logger.log(`Removing orphaned service: ${spu.type_name} (ID: ${spu.id})`);
            }
          } catch (error) {
            // Si hay error, consideramos que el servicio no existe
            removed++;
            removedServices.push({
              id: spu.id,
              name: spu.type_name,
              categoryId: category.id,
              serviceRef: spu.serviceRef || null,
              error: error instanceof Error ? error.message : 'Unknown error',
              reason: 'Error during validation'
            });
            this.logger.error(`Error validating service ${spu.id}, removing:`, error);
          }
        }
        
        // Actualizar la lista con solo servicios válidos
        category.spuList = validSpuList;
        this.logger.log(`Category ${category.id}: removed ${originalCount - validSpuList.length} orphaned services`);
      }

      // Guardar cambios si se removieron servicios
      if (removed > 0) {
        await catalog.save();
        this.logger.log(`Orphaned services cleanup completed: ${removed} services removed`);
      }

      const remainingServices = catalog.list.reduce((total, cat) => total + cat.spuList.length, 0);

      return {
        removed,
        removedServices,
        remainingServices,
        totalOriginal,
        message: removed > 0 ? 
          `${removed} servicios huérfanos eliminados exitosamente` : 
          'No se encontraron servicios huérfanos'
      };

    } catch (error) {
      this.logger.error('Error removing orphaned services:', error);
      throw error;
    }
  }

  /**
   * �️ Eliminar servicios huérfanos usando ObjectId (NUEVA VERSIÓN)
   */
  async removeOrphanedServicesWithObjectId(language: string) {
    try {
      this.logger.log(`Starting orphaned services cleanup for language: ${language} (ObjectId mode)`);
      
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catalog not found for language: ${language}`);
      }

      let removed = 0;
      const removedServices = [];
      const totalOriginal = catalog.list.reduce((total, cat) => total + cat.spuList.length, 0);

      for (const category of catalog.list) {
        const validSpuList = [];
        const originalCount = category.spuList.length;

        for (const spu of category.spuList) {
          try {
            let serviceExists = false;

            // Validar usando serviceId (ObjectId)
            if (spu.serviceId) {
              try {
                await this.servicesService.getServiceByIdForCatalog(spu.serviceId.toString());
                serviceExists = true;
              } catch (error) {
                this.logger.error(`Service with ObjectId ${spu.serviceId} not found:`, error);
                serviceExists = false;
              }
            } else {
              // Si no tiene serviceId, es un servicio huérfano
              this.logger.warn(`Service '${spu.type_name}' has no serviceId - marking as orphaned`);
              serviceExists = false;
            }
            
            if (serviceExists) {
              validSpuList.push(spu);
            } else {
              removed++;
              removedServices.push({
                serviceId: spu.serviceId || null,
                type_id: spu.type_id || null,
                name: spu.type_name,
                categoryId: category.id,
                reason: spu.serviceId ? 
                  'Service with ObjectId not found' : 
                  'Missing serviceId'
              });
              this.logger.log(`Removing orphaned service: ${spu.type_name} (ServiceId: ${spu.serviceId || 'N/A'})`);
            }
          } catch (error) {
            // Si hay error, consideramos que el servicio no existe
            removed++;
            removedServices.push({
              serviceId: spu.serviceId || null,
              type_id: spu.type_id || null,
              name: spu.type_name,
              categoryId: category.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              reason: 'Error during validation'
            });
            this.logger.error(`Error validating service ${spu.type_name}, removing:`, error);
          }
        }
        
        // Actualizar la lista con solo servicios válidos
        category.spuList = validSpuList;
        this.logger.log(`Category ${category.id}: removed ${originalCount - validSpuList.length} orphaned services`);
      }

      // Guardar cambios si se removieron servicios
      if (removed > 0) {
        await catalog.save();
        this.logger.log(`Orphaned services cleanup completed: ${removed} services removed`);
      }

      const remainingServices = catalog.list.reduce((total, cat) => total + cat.spuList.length, 0);

      return {
        removed,
        removedServices,
        remainingServices,
        totalOriginal,
        message: removed > 0 ? 
          `${removed} servicios huérfanos eliminados exitosamente` : 
          'No se encontraron servicios huérfanos'
      };

    } catch (error) {
      this.logger.error('Error removing orphaned services with ObjectId:', error);
      throw error;
    }
  }

  /**
   * �💰 Extraer precio mínimo de un servicio
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

  /**
   * 🧹 Realizar limpieza completa del catálogo (sync + cleanup)
   */
  async performFullCatalogCleanup(language: string) {
    try {
      this.logger.log(`Starting full catalog cleanup for language: ${language}`);
      
      // 1. Primero sincronizar servicios existentes
      const syncResult = await this.syncAllServices(language);
      
      // 2. Luego eliminar servicios huérfanos
      const cleanupResult = await this.removeOrphanedServices(language);
      
      // 3. Validar integridad final
      const validationResult = await this.validateIntegrity(language);
      
      return {
        sync: syncResult,
        cleanup: cleanupResult,
        finalValidation: validationResult,
        summary: {
          servicesUpdated: syncResult.updated,
          orphansRemoved: cleanupResult.removed,
          finalIssues: validationResult.issues.length,
          isNowValid: validationResult.isValid
        },
        message: validationResult.isValid ? 
          'Limpieza completa exitosa: catálogo totalmente sincronizado' :
          `Limpieza completada con ${validationResult.issues.length} problemas restantes`
      };

    } catch (error) {
      this.logger.error('Error performing full catalog cleanup:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtener estadísticas del catálogo
   */
  async getCatalogStats(language: string) {
    try {
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catalog not found for language: ${language}`);
      }

      const totalServices = catalog.list.reduce((total, cat) => total + cat.spuList.length, 0);
      const servicesWithRefs = catalog.list.reduce((total, cat) => 
        total + cat.spuList.filter((spu: any) => spu.serviceRef).length, 0);
      
      // Agrupar por categorías
      const categoryStats = catalog.list.map(category => ({
        id: category.id,
        name: `Category ${category.id}`,
        totalServices: category.spuList.length,
        servicesWithRefs: category.spuList.filter((spu: any) => spu.serviceRef).length,
        avgPrice: category.spuList.length > 0 ? 
          (category.spuList.reduce((sum: number, spu: any) => sum + parseFloat(spu.min_price || '0'), 0) / category.spuList.length).toFixed(2) : 
          '0.00'
      }));

      // Precios
      const allPrices = catalog.list.flatMap(cat => 
        cat.spuList.map((spu: any) => parseFloat(spu.min_price || '0')).filter((p: number) => p > 0)
      );

      return {
        language,
        overview: {
          total_services: totalServices,
          services_with_refs: servicesWithRefs,
          services_without_refs: totalServices - servicesWithRefs,
          categories: catalog.list.length
        },
        pricing: {
          min_price: allPrices.length > 0 ? Math.min(...allPrices).toFixed(2) : '0.00',
          max_price: allPrices.length > 0 ? Math.max(...allPrices).toFixed(2) : '0.00',
          avg_price: allPrices.length > 0 ? 
            (allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length).toFixed(2) : '0.00'
        },
        categories: categoryStats,
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error getting catalog stats:', error);
      throw error;
    }
  }

  private async createDefaultCatalog(language: string) {
    try {
      this.logger.log(`Creating default catalog for language: ${language}`);
      
      // Cargar datos mock desde archivo JSON
      const mockData = MockDataLoader.loadDefaultCatalog();
      
      if (!mockData) {
        throw new Error('Could not load default catalog data');
      }

      const defaultCatalog = new this.catalogModel({
        language,
        ...mockData
      });

      this.logger.log('Saving default catalog to database');
      const savedCatalog = await defaultCatalog.save();
      this.logger.log('Default catalog saved successfully');
      
      return {
        code: 0,
        message: 'Catálogo por defecto creado',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          classify_tab: savedCatalog.classify_tab,
          statistics: savedCatalog.statistics,
          list: savedCatalog.list
        }
      };
    } catch (error) {
      this.logger.error('Error creating default catalog:', error);
      throw error;
    }
  }


   async unlockServiceForCatalog(serviceId: string) {
    try {
      this.logger.log(`Unlocking service ${serviceId} in all catalogs`);
      
      const catalogs = await this.catalogModel.find({ 'list.spuList.serviceId': serviceId }).exec();

      for (const catalog of catalogs) {
        const spu = catalog.list.flatMap(cat => cat.spuList).find((spu: any) => spu.serviceId.toString() === serviceId.toString());
        console.log("spu to unlock", spu);
        if (spu) {
          spu.lock_status = 0; // Unlock the service
          this.logger.log(`Service ${serviceId} unlocked in catalog ${catalog._id}`);
        }
      }
      console.log("catalogs to update", catalogs);
      await this.catalogModel.bulkSave(catalogs);
      this.logger.log('All catalogs updated successfully');
    } catch (error) {
      this.logger.error('Error unlocking service in catalogs:', error);
      throw error;
    }
    
    }

  async lockServiceForCatalog(serviceId: string) {
    try {
      this.logger.log(`Locking service ${serviceId} in all catalogs`);
      
      const catalogs = await this.catalogModel.find({ 'list.spuList.serviceId': serviceId }).exec();

      for (const catalog of catalogs) {
        const spu = catalog.list.flatMap(cat => cat.spuList).find((spu: any) => spu.serviceId.toString() === serviceId.toString());
        console.log("spu to lock", spu);
        if (spu) {
          spu.lock_status = 1; // Lock the service
          this.logger.log(`Service ${serviceId} locked in catalog ${catalog._id}`);
        }
      }
      console.log("catalogs to update", catalogs);
      await this.catalogModel.bulkSave(catalogs);
      this.logger.log('All catalogs updated successfully');
    } catch (error) {
      this.logger.error('Error locking service in catalogs:', error);
      throw error;
    }
    
    }
  }
