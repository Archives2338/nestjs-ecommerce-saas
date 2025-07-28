import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog, CatalogDocument } from './schemas/catalog.schema';
import { GetTypeClassifyListDto, UpdateCatalogDto } from './dto/catalog.dto';
import { MockDataLoader } from '../utils/mock-data-loader';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
  ) {}

  async getTypeClassifyList(getTypeClassifyListDto: GetTypeClassifyListDto) {
    try {
      this.logger.log(`Searching for catalog with language: ${getTypeClassifyListDto.language}`);
      
      const catalog = await this.catalogModel.findOne({ 
        language: getTypeClassifyListDto.language
      }).exec();

      if (!catalog) {
        this.logger.log('No catalog found, creating default catalog');
        return this.createDefaultCatalog(getTypeClassifyListDto.language);
      }
      console.log(catalog);
      this.logger.log('Catalog found successfully');
      return {
        code: 0,
        message: 'Listo',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          classify_tab: catalog.classify_tab,
          statistics: catalog.statistics,
          list: catalog.list
        }
      };
    } catch (error) {
      this.logger.error('Error in getTypeClassifyList:', error);
      return {
        code: 1,
        message: 'Error al obtener catálogo',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

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
}
