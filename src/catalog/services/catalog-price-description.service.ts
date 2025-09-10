import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog, CatalogDocument } from '../schemas/catalog.schema';

@Injectable()
export class CatalogPriceDescriptionService {
  private readonly logger = new Logger(CatalogPriceDescriptionService.name);

  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
  ) {}

  /**
   * Modifica el min_price y el array description de un servicio específico en el catálogo
   * @param language Idioma del catálogo
   * @param serviceId ID del servicio (type_id del servicio)
   * @param min_price Nuevo precio mínimo
   * @param description Nuevo array de descripción
   */
  async updateServicePriceAndDescription(language: string, serviceId: string, min_price: number, description: string[]) {
    try {
      const catalog = await this.catalogModel.findOne({ language }).exec();
      if (!catalog) {
        throw new Error(`Catálogo no encontrado para el idioma: ${language}`);
      }

      let serviceFound = false;
      console.log(`Buscando servicio ${serviceId} en el catálogo...`);
      console.log(`Catálogo encontrado:`, JSON.stringify(catalog.id, null, 2));
      console.log(`Min_price recibido:`, min_price);
      console.log(`Description recibida:`, JSON.stringify(description, null, 2));
      
      // Buscar el servicio en todas las categorías del catálogo
      for (const category of catalog.list) {
        console.log(`Revisando categoría: ${category.name || 'Sin nombre'}`);
        for (const service of category.spuList) {
          console.group("service", service);
          if (service.serviceId.toString() === serviceId) {
            console.log(`¡Servicio ${serviceId} encontrado! Actualizando...`);
            service.min_price = min_price;
            service.description = description;
            console.log(`Servicio actualizado:`, JSON.stringify({
              id: service.id,
              name: service.name,
              min_price: service.min_price,
              description: service.description
            }, null, 2));
            serviceFound = true;
            this.logger.log(`Servicio ${serviceId} actualizado: min_price=${min_price}, description actualizada`);
            break;
          }
        }
        if (serviceFound) break;
      }

      if (!serviceFound) {
        throw new Error(`Servicio con ID ${serviceId} no encontrado en el catálogo`);
      }

      await catalog.save();
      
      return {
        code: 0,
        message: 'Servicio actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          serviceId,
          min_price,
          description
        }
      };

    } catch (error) {
      this.logger.error('Error updating service price and description:', error);
      return {
        code: 1,
        message: (error as Error).message || 'Error al actualizar servicio',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }
}
