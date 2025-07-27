import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body, 
  Query, 
  Logger,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ContentService } from './content.service';
import { GetWebpageContentDto, UpdateWebpageContentDto, BulkUpdateContentDto } from './dto/content.dto';

@Controller('api')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService) {}

  /**
   * Endpoint principal para obtener contenido de webpage (compatible con GamsGo API)
   * POST /api/webpage/key
   * Body: { key: string[], language: string }
   */
  @Post('webpage/key')
  @HttpCode(HttpStatus.OK)
  async getWebpageContentByKeys(@Body() getWebpageContentDto: GetWebpageContentDto) {
    try {
      this.logger.log(`Getting webpage content for language: ${getWebpageContentDto.language}, keys: ${getWebpageContentDto.key.length}`);

      return await this.contentService.getWebpageContent(getWebpageContentDto);

    } catch (error) {
      this.logger.error('Error in getWebpageContentByKeys endpoint:', error);
      return {
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: {}
      };
    }
  }

  /**
   * Endpoint alternativo para obtener contenido de webpage
   * GET /api/webpage/:language
   * Query params: key[] (array de claves de contenido)
   */
  @Get('webpage/:language')
  @HttpCode(HttpStatus.OK)
  async getWebpageContent(
    @Param('language') language: string,
    @Query('key') keys: string | string[]
  ) {
    try {
      this.logger.log(`Getting webpage content for language: ${language}, keys: ${keys}`);

      // Normalizar keys a array
      const keyArray = Array.isArray(keys) ? keys : [keys];

      const getWebpageContentDto: GetWebpageContentDto = {
        language,
        key: keyArray
      };

      return await this.contentService.getWebpageContent(getWebpageContentDto);

    } catch (error) {
      this.logger.error('Error in getWebpageContent endpoint:', error);
      return {
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: {}
      };
    }
  }

  /**
   * Endpoint para obtener todo el contenido de un idioma específico
   * GET /api/webpage/:language/all
   */
  @Get('webpage/:language/all')
  @HttpCode(HttpStatus.OK)
  async getAllWebpageContent(@Param('language') language: string) {
    try {
      this.logger.log(`Getting all webpage content for language: ${language}`);

      // Obtener todas las secciones disponibles
      const allSections = ['head', 'footer', 'home', 'auth', 'catalog', 'checkout', 'profile'];
      
      const getWebpageContentDto: GetWebpageContentDto = {
        language,
        key: allSections
      };

      return await this.contentService.getWebpageContent(getWebpageContentDto);

    } catch (error) {
      this.logger.error('Error in getAllWebpageContent endpoint:', error);
      return {
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: {}
      };
    }
  }

  /**
   * Endpoint para actualizar contenido de una sección específica
   * PUT /api/webpage/:language/:section
   */
  @Put('webpage/:language/:section')
  @HttpCode(HttpStatus.OK)
  async updateSectionContent(
    @Param('language') language: string,
    @Param('section') section: string,
    @Body() updateData: UpdateWebpageContentDto
  ) {
    try {
      this.logger.log(`Updating section ${section} for language: ${language}`);

      updateData.language = language;
      updateData.section = section;

      // Para actualización de sección específica, necesitamos preparar los datos
      const bulkUpdateData: BulkUpdateContentDto = {
        language,
        content: {
          [section]: updateData.content || {}
        }
      };

      return await this.contentService.updateWebpageContent(language, bulkUpdateData);

    } catch (error) {
      this.logger.error('Error in updateSectionContent endpoint:', error);
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

  /**
   * Endpoint para actualización masiva de contenido
   * PUT /api/webpage/:language
   */
  @Put('webpage/:language')
  @HttpCode(HttpStatus.OK)
  async updateBulkContent(
    @Param('language') language: string,
    @Body() updateData: BulkUpdateContentDto
  ) {
    try {
      this.logger.log(`Bulk updating content for language: ${language}`);

      updateData.language = language;

      return await this.contentService.updateWebpageContent(language, updateData);

    } catch (error) {
      this.logger.error('Error in updateBulkContent endpoint:', error);
      return {
        code: 1,
        message: 'Error al actualizar contenido masivamente',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Endpoint para obtener idiomas soportados
   * GET /api/webpage/languages
   */
  @Get('webpage/languages')
  @HttpCode(HttpStatus.OK)
  async getSupportedLanguages() {
    try {
      this.logger.log('Getting supported languages');

      const languages = await this.contentService.getSupportedLanguages();

      return {
        code: 0,
        message: 'Idiomas obtenidos exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          languages,
          total: languages.length
        }
      };

    } catch (error) {
      this.logger.error('Error in getSupportedLanguages endpoint:', error);
      return {
        code: 1,
        message: 'Error al obtener idiomas',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: {
          languages: ['es', 'en'],
          total: 2
        }
      };
    }
  }

  /**
   * Endpoint para obtener estadísticas de contenido
   * GET /api/webpage/stats
   * GET /api/webpage/stats/:language
   */
  @Get('webpage/stats/:language?')
  @HttpCode(HttpStatus.OK)
  async getContentStatistics(@Param('language') language?: string) {
    try {
      this.logger.log(`Getting content statistics for language: ${language || 'all'}`);

      return await this.contentService.getContentStatistics(language);

    } catch (error) {
      this.logger.error('Error in getContentStatistics endpoint:', error);
      return {
        code: 1,
        message: 'Error al obtener estadísticas',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: []
      };
    }
  }

  /**
   * Endpoint para inicializar contenido por defecto
   * POST /api/webpage/:language/initialize
   */
  @Post('webpage/:language/initialize')
  @HttpCode(HttpStatus.CREATED)
  async initializeDefaultContent(@Param('language') language: string) {
    try {
      this.logger.log(`Initializing default content for language: ${language}`);

      // Forzar la creación de contenido por defecto
      const result = await this.contentService.getWebpageContent({
        language,
        key: ['head', 'footer', 'home']
      });

      return {
        code: 0,
        message: `Contenido por defecto inicializado para idioma: ${language}`,
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: result.data
      };

    } catch (error) {
      this.logger.error('Error in initializeDefaultContent endpoint:', error);
      return {
        code: 1,
        message: 'Error al inicializar contenido por defecto',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Endpoint temporal para debugging - verificar carga de mock data
   * GET /api/webpage/debug/mock/:language
   */
  @Get('webpage/debug/mock/:language')
  @HttpCode(HttpStatus.OK)
  async debugMockContent(@Param('language') language: string) {
    try {
      this.logger.log(`Debug: Testing mock content loading for language: ${language}`);

      // Importar y usar MockDataLoader directamente
      const { MockDataLoader } = await import('../utils/mock-data-loader');
      const mockDataLoader = new MockDataLoader();
      const mockContent = mockDataLoader.loadContentData(language);

      return {
        code: 0,
        message: 'Debug successful',
        data: {
          language,
          mockContentLoaded: !!mockContent,
          mockContentSections: mockContent?.content ? Object.keys(mockContent.content) : [],
          homeKeys: mockContent?.content?.home ? Object.keys(mockContent.content.home) : [],
          sampleHomeContent: mockContent?.content?.home ? {
            home11: mockContent.content.home.home11,
            home12: mockContent.content.home.home12,
            home30: mockContent.content.home.home30
          } : null
        }
      };

    } catch (error) {
      this.logger.error('Error in debug endpoint:', error);
      return {
        code: 1,
        message: 'Debug failed',
        data: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Endpoint para forzar actualización desde mock data
   * POST /api/webpage/:language/reload-from-mock
   */
  @Post('webpage/:language/reload-from-mock')
  @HttpCode(HttpStatus.OK)
  async reloadFromMock(@Param('language') language: string) {
    try {
      this.logger.log(`Force reloading content from mock for language: ${language}`);

      // Eliminar contenido existente
      await this.contentService.deleteContent(language);

      // Cargar desde mock directamente
      const { MockDataLoader } = await import('../utils/mock-data-loader');
      const mockContent = MockDataLoader.loadContentData(language);

      if (!mockContent || !mockContent.content) {
        throw new Error('Failed to load mock content');
      }

      // Crear nuevo contenido usando los datos mock
      const bulkUpdateData = {
        language,
        content: mockContent.content,
        version: mockContent.version || 1,
        metadata: mockContent.metadata
      };

      const result = await this.contentService.updateWebpageContent(language, bulkUpdateData);

      return {
        code: 0,
        message: `Contenido recargado desde mock para idioma: ${language}`,
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          sectionsLoaded: Object.keys(mockContent.content).length,
          homeKeys: Object.keys(mockContent.content.home || {}).length,
          result
        }
      };

    } catch (error) {
      this.logger.error('Error reloading from mock:', error);
      return {
        code: 1,
        message: 'Error al recargar desde mock',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }
}
