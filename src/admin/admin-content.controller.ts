import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from './guards/admin-permission.guard';
import { Permissions } from './decorators/permissions.decorator';

interface ContentItem {
  id: string;
  language: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Controller('api/admin/content')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
export class AdminContentController {
  // Base de datos simulada de contenido
  private content: ContentItem[] = [
    {
      id: '1',
      language: 'es',
      key: 'home.title',
      value: 'Bienvenido a nuestra plataforma',
      category: 'home',
      description: 'Título principal de la página de inicio',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '2',
      language: 'en',
      key: 'home.title',
      value: 'Welcome to our platform',
      category: 'home',
      description: 'Main title for the home page',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '3',
      language: 'es',
      key: 'home.subtitle',
      value: 'Descubre miles de contenidos streaming',
      category: 'home',
      description: 'Subtítulo de la página de inicio',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ];

  /**
   * 📋 Obtener todo el contenido con filtros
   * GET /api/admin/content
   */
  @Get()
  @Permissions('content:read')
  async getAllContent(
    @Query('language') language?: string,
    @Query('category') category?: string,
    @Query('key') key?: string,
    @Query('isActive') isActive?: string
  ) {
    let filteredContent = [...this.content];

    if (language) {
      filteredContent = filteredContent.filter(item => item.language === language);
    }

    if (category) {
      filteredContent = filteredContent.filter(item => item.category === category);
    }

    if (key) {
      filteredContent = filteredContent.filter(item => 
        item.key.toLowerCase().includes(key.toLowerCase())
      );
    }

    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredContent = filteredContent.filter(item => item.isActive === activeFilter);
    }

    return {
      success: true,
      message: 'Contenido obtenido exitosamente',
      data: {
        content: filteredContent,
        total: filteredContent.length,
        languages: [...new Set(this.content.map(item => item.language))],
        categories: [...new Set(this.content.map(item => item.category))]
      }
    };
  }

  /**
   * 🔍 Obtener contenido por ID
   * GET /api/admin/content/:id
   */
  @Get(':id')
  @Permissions('content:read')
  async getContentById(@Param('id') id: string) {
    const contentItem = this.content.find(item => item.id === id);

    if (!contentItem) {
      return {
        success: false,
        message: 'Contenido no encontrado',
        data: null
      };
    }

    return {
      success: true,
      message: 'Contenido obtenido exitosamente',
      data: contentItem
    };
  }

  /**
   * ➕ Crear nuevo contenido
   * POST /api/admin/content
   */
  @Post()
  @Permissions('content:create')
  @HttpCode(HttpStatus.CREATED)
  async createContent(@Body() createContentDto: any) {
    const existingContent = this.content.find(
      item => item.language === createContentDto.language && item.key === createContentDto.key
    );

    if (existingContent) {
      return {
        success: false,
        message: 'Ya existe contenido con esta clave para este idioma',
        error: 'CONTENT_ALREADY_EXISTS'
      };
    }

    const newContent: ContentItem = {
      id: (this.content.length + 1).toString(),
      language: createContentDto.language,
      key: createContentDto.key,
      value: createContentDto.value,
      category: createContentDto.category || 'general',
      description: createContentDto.description,
      isActive: createContentDto.isActive !== undefined ? createContentDto.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.content.push(newContent);

    return {
      success: true,
      message: 'Contenido creado exitosamente',
      data: newContent
    };
  }

  /**
   * ✏️ Actualizar contenido existente
   * PUT /api/admin/content/:id
   */
  @Put(':id')
  @Permissions('content:update')
  @HttpCode(HttpStatus.OK)
  async updateContent(@Param('id') id: string, @Body() updateContentDto: any) {
    const contentIndex = this.content.findIndex(item => item.id === id);

    if (contentIndex === -1) {
      return {
        success: false,
        message: 'Contenido no encontrado',
        error: 'CONTENT_NOT_FOUND'
      };
    }

    const updatedContent = {
      ...this.content[contentIndex],
      ...updateContentDto,
      updatedAt: new Date()
    };

    this.content[contentIndex] = updatedContent;

    return {
      success: true,
      message: 'Contenido actualizado exitosamente',
      data: updatedContent
    };
  }

  /**
   * 🗑️ Eliminar contenido
   * DELETE /api/admin/content/:id
   */
  @Delete(':id')
  @Permissions('content:delete')
  @HttpCode(HttpStatus.OK)
  async deleteContent(@Param('id') id: string) {
    const contentIndex = this.content.findIndex(item => item.id === id);

    if (contentIndex === -1) {
      return {
        success: false,
        message: 'Contenido no encontrado',
        error: 'CONTENT_NOT_FOUND'
      };
    }

    const deletedContent = this.content.splice(contentIndex, 1)[0];

    return {
      success: true,
      message: 'Contenido eliminado exitosamente',
      data: deletedContent
    };
  }

  /**
   * 🔄 Activar/Desactivar contenido
   * PUT /api/admin/content/:id/toggle-status
   */
  @Put(':id/toggle-status')
  @Permissions('content:update')
  @HttpCode(HttpStatus.OK)
  async toggleContentStatus(@Param('id') id: string) {
    const contentIndex = this.content.findIndex(item => item.id === id);

    if (contentIndex === -1) {
      return {
        success: false,
        message: 'Contenido no encontrado',
        error: 'CONTENT_NOT_FOUND'
      };
    }

    this.content[contentIndex].isActive = !this.content[contentIndex].isActive;
    this.content[contentIndex].updatedAt = new Date();

    return {
      success: true,
      message: `Contenido ${this.content[contentIndex].isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: this.content[contentIndex]
    };
  }

  /**
   * 📊 Estadísticas de contenido
   * GET /api/admin/content/stats
   */
  @Get('stats/summary')
  @Permissions('content:read')
  async getContentStats() {
    const stats = {
      total: this.content.length,
      active: this.content.filter(item => item.isActive).length,
      inactive: this.content.filter(item => !item.isActive).length,
      byLanguage: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    // Estadísticas por idioma
    this.content.forEach(item => {
      if (!stats.byLanguage[item.language]) {
        stats.byLanguage[item.language] = 0;
      }
      stats.byLanguage[item.language]++;
    });

    // Estadísticas por categoría
    this.content.forEach(item => {
      if (!stats.byCategory[item.category]) {
        stats.byCategory[item.category] = 0;
      }
      stats.byCategory[item.category]++;
    });

    return {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    };
  }

  /**
   * 📥 Importar contenido masivo
   * POST /api/admin/content/bulk-import
   */
  @Post('bulk-import')
  @Permissions('content:create')
  @HttpCode(HttpStatus.CREATED)
  async bulkImportContent(@Body() importData: { content: any[] }) {
    const results = {
      created: 0,
      updated: 0,
      errors: [] as Array<{ item: any; error: string }>
    };

    for (const item of importData.content) {
      try {
        const existingIndex = this.content.findIndex(
          existing => existing.language === item.language && existing.key === item.key
        );

        if (existingIndex !== -1) {
          // Actualizar existente
          this.content[existingIndex] = {
            ...this.content[existingIndex],
            ...item,
            updatedAt: new Date()
          };
          results.updated++;
        } else {
          // Crear nuevo
          const newContent: ContentItem = {
            id: (this.content.length + results.created + 1).toString(),
            language: item.language,
            key: item.key,
            value: item.value,
            category: item.category || 'general',
            description: item.description,
            isActive: item.isActive !== undefined ? item.isActive : true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.content.push(newContent);
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          item,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    return {
      success: true,
      message: 'Importación completada',
      data: results
    };
  }
}
