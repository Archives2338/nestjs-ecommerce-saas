import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebpageContent, WebpageContentDocument } from './schemas/webpage-content.schema';
import { GetWebpageContentDto, UpdateWebpageContentDto, BulkUpdateContentDto } from './dto/content.dto';
import { MockDataLoader } from '../utils/mock-data-loader';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(WebpageContent.name) private webpageContentModel: Model<WebpageContentDocument>,
  ) {}

  async getWebpageContent(getWebpageContentDto: GetWebpageContentDto) {
    try {
      const { key: requestedKeys, language } = getWebpageContentDto;
      
      this.logger.log(`Getting webpage content for language: ${language}, keys: ${requestedKeys.length}`);

      // Buscar contenido en la base de datos
      let webpageContent = await this.webpageContentModel.findOne({
        language,
        isActive: true
      }).exec();

      // Si no existe, crear contenido por defecto
      if (!webpageContent) {
        this.logger.log(`No content found for language ${language}, creating default content`);
        webpageContent = await this.createDefaultContent(language);
      }

      // Verificar que el contenido existe
      if (!webpageContent || !webpageContent.content) {
        throw new Error(`Could not load or create content for language: ${language}`);
      }

      // Filtrar contenido según las keys solicitadas
      const filteredContent = this.filterContentByKeys(webpageContent.content, requestedKeys);

      // Procesar parámetros dinámicos
      const processedContent = this.processContentParams(filteredContent);

      return {
        code: 0,
        message: 'Listo',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: processedContent
      };

    } catch (error) {
      this.logger.error('Error getting webpage content:', error);
      return {
        code: 1,
        message: 'Error al obtener contenido',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: {}
      };
    }
  }

  async updateWebpageContent(language: string, updateData: BulkUpdateContentDto) {
    try {
      this.logger.log(`Updating webpage content for language: ${language}`);

      const updatedContent = await this.webpageContentModel.findOneAndUpdate(
        { language, isActive: true },
        {
          ...updateData,
          version: updateData.version || 1,
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      ).exec();

      return {
        code: 0,
        message: 'Contenido actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: updatedContent
      };

    } catch (error) {
      this.logger.error('Error updating webpage content:', error);
      return {
        code: 1,
        message: 'Error al actualizar contenido',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  async deleteContent(language: string) {
    try {
      this.logger.log(`Deleting content for language: ${language}`);
      const result = await this.webpageContentModel.deleteMany({ language });
      this.logger.log(`Deleted ${result.deletedCount} documents for language: ${language}`);
      return result;
    } catch (error) {
      this.logger.error('Error deleting content:', error);
      throw error;
    }
  }

  async getSupportedLanguages(): Promise<string[]> {
    try {
      const languages = await this.webpageContentModel.distinct('language', { isActive: true });
      return languages;
    } catch (error) {
      this.logger.error('Error getting supported languages:', error);
      return ['es', 'en']; // fallback
    }
  }

  async getContentStatistics(language?: string) {
    try {
      const query = language ? { language, isActive: true } : { isActive: true };
      
      const stats = await this.webpageContentModel.aggregate([
        { $match: query },
        {
          $project: {
            language: 1,
            sectionsCount: { $size: { $objectToArray: '$content' } },
            version: 1,
            updatedAt: 1
          }
        }
      ]);

      return {
        code: 0,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      };

    } catch (error) {
      this.logger.error('Error getting content statistics:', error);
      return {
        code: 1,
        message: 'Error al obtener estadísticas',
        data: []
      };
    }
  }

  private async createDefaultContent(language: string): Promise<WebpageContentDocument | null> {
    try {
      this.logger.log(`Creating default content for language: ${language}`);

      // Cargar contenido mock desde archivo JSON o crear estructura básica
      const defaultContentData = this.getDefaultContentStructure(language);

      const newContent = new this.webpageContentModel({
        language,
        content: defaultContentData,
        version: 1,
        metadata: {
          totalSections: Object.keys(defaultContentData).length,
          totalKeys: this.countTotalKeys(defaultContentData),
          lastSyncAt: new Date(),
          sourceVersion: '1.0.0'
        }
      });

      const savedContent = await newContent.save();
      this.logger.log(`Default content created for language: ${language}`);
      
      return savedContent;

    } catch (error) {
      this.logger.error('Error creating default content:', error);
      return null;
    }
  }

  private getDefaultContentStructure(language: string) {
    try {
      // Intentar cargar contenido desde archivo mock
      this.logger.log(`Attempting to load mock content for language: ${language}`);
      const mockDataLoader = new MockDataLoader();
      const mockContent = mockDataLoader.loadContentData(language);
      
      if (mockContent && mockContent.content) {
        this.logger.log(`Successfully loaded mock content for language: ${language} with ${Object.keys(mockContent.content).length} sections`);
        return mockContent.content;
      } else {
        this.logger.warn(`Mock content is empty or invalid for language: ${language}`);
      }
    } catch (error) {
      this.logger.error(`Failed to load mock content for language ${language}:`, error instanceof Error ? error.message : error);
    }

    // Fallback: estructura básica de contenido por defecto
    const defaultContent = {
      head: {
        head1: language === 'es' ? 'PÁGINA DE INICIO' : 'HOME PAGE',
        head2: 'AFFILIATE',
        head3: language === 'es' ? 'SOPORTE POST-VENTA' : 'POST-SALE SUPPORT',
        head4: language === 'es' ? 'SUSCRIPCIÓN' : 'SUBSCRIPTION',
        head5: language === 'es' ? 'VENDENOS' : 'SELL TO US',
        head6: language === 'es' ? 'Buscar...' : 'Search...',
        head7: language === 'es' ? 'No se encontraron resultados, prueba con otra búsqueda' : 'No results found, try another search',
        params: {
          '{affiliate_Big}': 'AFFILIATE'
        }
      },
      footer: {
        footer1: language === 'es' ? 'ACERCA DE' : 'ABOUT',
        footer2: language === 'es' ? 'Sobre nosotros' : 'About us',
        footer3: language === 'es' ? 'Contáctenos' : 'Contact us',
        footer4: language === 'es' ? 'Centro de ayuda' : 'Help center',
        footer5: language === 'es' ? 'Programa de Afiliados' : 'Affiliate Program',
        footer14: language === 'es' ? 'IDIOMA' : 'LANGUAGE',
        footer15: language === 'es' ? 'PAÍS' : 'COUNTRY',
        footer16: language === 'es' ? 'SERVICIO AL CLIENTE' : 'CUSTOMER SERVICE',
        params: {
          '{gamsGo}': 'GamsGo',
          '{terms_And_Condition}': language === 'es' ? 'TÉRMINOS Y CONDICIONES' : 'TERMS AND CONDITIONS',
          '{privacy_Policy}': language === 'es' ? 'POLÍTICA DE PRIVACIDAD' : 'PRIVACY POLICY'
        }
      },
      home: {
        home1: language === 'es' ? 'Comparta la suscripción premium más barato en {gamsGo}' : 'Share the cheapest premium subscription on {gamsGo}',
        home2: language === 'es' ? 'Usuarios' : 'Users',
        home3: language === 'es' ? 'Participaciones' : 'Participations',
        home4: '{year}+ ' + (language === 'es' ? 'años' : 'years'),
        home5: language === 'es' ? 'Funcionado' : 'Running',
        params: {
          '{gamsGo}': 'GamsGo',
          '{year}': '6'
        }
      }
    };

    return defaultContent;
  }

  private filterContentByKeys(content: Record<string, any>, requestedKeys: string[]): Record<string, any> {
    const filtered: Record<string, any> = {};
    
    // Buscar en cada sección del contenido
    for (const [sectionKey, sectionValue] of Object.entries(content)) {
      if (sectionValue && typeof sectionValue === 'object') {
        const sectionResult: Record<string, any> = {};
        let hasMatchingKeys = false;
        
        // Buscar claves solicitadas en esta sección
        for (const requestedKey of requestedKeys) {
          if ((sectionValue as any)[requestedKey] !== undefined) {
            sectionResult[requestedKey] = (sectionValue as any)[requestedKey];
            hasMatchingKeys = true;
          }
        }
        
        // Si hay claves coincidentes, incluir la sección con sus parámetros
        if (hasMatchingKeys) {
          if ((sectionValue as any).params) {
            sectionResult.params = (sectionValue as any).params;
          }
          filtered[sectionKey] = sectionResult;
        }
      }
    }
    
    return filtered;
  }

  private processContentParams(content: Record<string, any>): Record<string, any> {
    const processed = JSON.parse(JSON.stringify(content)); // Deep clone
    
    // Procesar parámetros en cada sección
    for (const [sectionKey, sectionValue] of Object.entries(processed)) {
      if (sectionValue && typeof sectionValue === 'object' && 'params' in sectionValue) {
        const params = (sectionValue as any).params;
        
        // Reemplazar parámetros en todos los textos de la sección
        for (const [textKey, textValue] of Object.entries(sectionValue as Record<string, any>)) {
          if (textKey !== 'params' && typeof textValue === 'string') {
            let processedText = textValue;
            
            // Reemplazar cada parámetro
            if (params && typeof params === 'object') {
              for (const [paramKey, paramValue] of Object.entries(params)) {
                processedText = processedText.replace(
                  new RegExp(paramKey.replace(/[{}]/g, '\\$&'), 'g'), 
                  paramValue as string
                );
              }
            }
            
            (processed[sectionKey] as any)[textKey] = processedText;
          }
        }
      }
    }
    
    return processed;
  }

  private countTotalKeys(content: Record<string, any>): number {
    let count = 0;
    
    for (const section of Object.values(content)) {
      if (section && typeof section === 'object') {
        count += Object.keys(section).filter(key => key !== 'params').length;
      }
    }
    
    return count;
  }
}
