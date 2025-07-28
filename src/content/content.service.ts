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
      const { key: requestedSections, language } = getWebpageContentDto;
      
      this.logger.log(`Getting webpage content for language: ${language}, sections: ${requestedSections.join(', ')}`);

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

      // Filtrar contenido según las secciones solicitadas
      const filteredContent = this.filterContentBySections(webpageContent.content, requestedSections);

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

  async createContentFromMock(mockData: any): Promise<WebpageContentDocument> {
    try {
      this.logger.log(`Creating content from mock data for language: ${mockData.language}`);

      // Eliminar contenido existente SOLO para este idioma específico
      await this.webpageContentModel.deleteMany({ language: mockData.language });

      // Crear nuevo contenido solo para el idioma especificado
      const newContent = new this.webpageContentModel({
        language: mockData.language,
        content: mockData.content,
        version: mockData.version || 1,
        metadata: {
          totalSections: Object.keys(mockData.content).length,
          totalKeys: this.countTotalKeys(mockData.content),
          lastSyncAt: new Date(),
          sourceVersion: mockData.metadata?.sourceVersion || '1.0.0'
        },
        isActive: true
      });

      const savedContent = await newContent.save();
      this.logger.log(`Content created successfully for language: ${mockData.language} with ${Object.keys(mockData.content).length} sections`);
      
      return savedContent;

    } catch (error) {
      this.logger.error('Error creating content from mock data:', error);
      throw error;
    }
  }

  async updateSpanishContentOnly(): Promise<any> {
    try {
      this.logger.log('Updating ONLY Spanish content, preserving other languages');

      // Cargar contenido español desde archivo mock
      const mockDataLoader = new MockDataLoader();
      const spanishContent = mockDataLoader.loadContentData('es');
      
      if (!spanishContent) {
        throw new Error('Could not load Spanish content from JSON file');
      }

      // Eliminar SOLO contenido español existente
      const deleteResult = await this.webpageContentModel.deleteMany({ language: 'es' });
      this.logger.log(`Deleted ${deleteResult.deletedCount} Spanish documents`);

      // Crear nuevo contenido español
      const result = await this.createContentFromMock(spanishContent);
      
      return {
        code: 0,
        message: 'Contenido español actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          sectionsCreated: Object.keys(spanishContent.content).length,
          totalKeys: result.metadata?.totalKeys || 0,
          version: spanishContent.version,
          deletedDocuments: deleteResult.deletedCount
        }
      };
      
    } catch (error) {
      this.logger.error('Error updating Spanish content only:', error);
      return {
        code: 1,
        message: 'Error al actualizar contenido español',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  async updateSpanishContentWithActiveFlags(): Promise<any> {
    try {
      this.logger.log('Updating Spanish content with active flags support');

      // Cargar contenido español con active flags desde archivo mock
      const mockDataLoader = new MockDataLoader();
      const spanishContent = mockDataLoader.loadContentDataFromFile('default-content-es-with-active.json');
      
      if (!spanishContent) {
        throw new Error('Could not load Spanish content with active flags from JSON file');
      }

      // Eliminar SOLO contenido español existente
      const deleteResult = await this.webpageContentModel.deleteMany({ language: 'es' });
      this.logger.log(`Deleted ${deleteResult.deletedCount} Spanish documents`);

      // Crear nuevo contenido español con active flags
      const result = await this.createContentFromMock(spanishContent);
      
      return {
        code: 0,
        message: 'Contenido español con active flags actualizado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          sectionsCreated: Object.keys(spanishContent.content).length,
          totalKeys: result.metadata?.totalKeys || 0,
          version: spanishContent.version,
          deletedDocuments: deleteResult.deletedCount,
          supportsActiveFlags: true
        }
      };
      
    } catch (error) {
      this.logger.error('Error updating Spanish content with active flags:', error);
      return {
        code: 1,
        message: 'Error al actualizar contenido español con active flags',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  async updateEnglishContentWithActiveFlags(): Promise<any> {
    try {
      this.logger.log('Updating English content with active flags support');

      // Cargar contenido inglés con active flags desde archivo mock
      const mockDataLoader = new MockDataLoader();
      const englishContent = mockDataLoader.loadContentDataFromFile('default-content-en-with-active.json');
      
      if (!englishContent) {
        throw new Error('Could not load English content with active flags from JSON file');
      }

      // Eliminar SOLO contenido inglés existente
      const deleteResult = await this.webpageContentModel.deleteMany({ language: 'en' });
      this.logger.log(`Deleted ${deleteResult.deletedCount} English documents`);

      // Crear nuevo contenido inglés con active flags
      const result = await this.createContentFromMock(englishContent);
      
      return {
        code: 0,
        message: 'English content with active flags updated successfully',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          sectionsCreated: Object.keys(englishContent.content).length,
          totalKeys: result.metadata?.totalKeys || 0,
          version: englishContent.version,
          deletedDocuments: deleteResult.deletedCount,
          supportsActiveFlags: true
        }
      };
      
    } catch (error) {
      this.logger.error('Error updating English content with active flags:', error);
      return {
        code: 1,
        message: 'Error updating English content with active flags',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  async toggleContentKeyActive(language: string, section: string, key: string, active: boolean): Promise<any> {
    try {
      this.logger.log(`Toggling active flag for ${language}/${section}/${key} to ${active}`);

      // Buscar el documento de contenido
      const content = await this.webpageContentModel.findOne({
        language,
        isActive: true
      }).exec();

      if (!content) {
        throw new Error(`Content not found for language: ${language}`);
      }

      // Verificar que la sección existe
      if (!content.content[section]) {
        throw new Error(`Section '${section}' not found in content`);
      }

      // Verificar que la clave existe
      if (!content.content[section][key]) {
        throw new Error(`Key '${key}' not found in section '${section}'`);
      }

      // Actualizar el flag active
      const currentValue = content.content[section][key];
      if (typeof currentValue === 'object' && currentValue !== null && 'text' in currentValue) {
        // Formato con active flag
        content.content[section][key] = {
          ...currentValue,
          active: active
        };
      } else {
        // Convertir formato legacy a nuevo formato
        content.content[section][key] = {
          text: currentValue as string,
          active: active
        };
      }

      // Marcar como modificado y guardar
      content.markModified('content');
      content.updatedAt = new Date();
      const savedContent = await content.save();

      return {
        section,
        key,
        active,
        text: typeof currentValue === 'object' ? (currentValue as any).text : currentValue,
        updatedAt: savedContent.updatedAt
      };

    } catch (error) {
      this.logger.error('Error toggling content key active flag:', error);
      throw error;
    }
  }

  private filterContentBySections(content: Record<string, any>, requestedSections: string[]): Record<string, any> {
    const filtered: Record<string, any> = {};
    
    // Filtrar solo las secciones solicitadas
    for (const sectionName of requestedSections) {
      if (content[sectionName]) {
        const section = content[sectionName];
        const filteredSection: Record<string, any> = {};
        
        // Filtrar solo claves activas
        for (const [key, value] of Object.entries(section)) {
          if (key === 'params') {
            // Siempre incluir params
            filteredSection[key] = value;
          } else if (typeof value === 'object' && value !== null && 'active' in value) {
            // Nuevo formato con active flag
            const contentItem = value as { text: string; active: boolean };
            if (contentItem.active === true) {
              filteredSection[key] = contentItem.text;
            }
          } else if (typeof value === 'string') {
            // Formato legacy - incluir todo
            filteredSection[key] = value;
          }
        }
        
        filtered[sectionName] = filteredSection;
      } else {
        // Si la sección no existe, crear una sección vacía para evitar errores
        this.logger.warn(`Section '${sectionName}' not found in content`);
        filtered[sectionName] = {};
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
