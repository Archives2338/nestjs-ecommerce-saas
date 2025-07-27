import { Controller, Post, Body, Put, Param, Logger } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { GetTypeClassifyListDto, UpdateCatalogDto } from './dto/catalog.dto';
import { GetTenantId } from '../tenant/tenant.decorator';

@Controller('index')
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);
  
  constructor(private readonly catalogService: CatalogService) {}

  @Post('getTypeClassifyList')
  async getTypeClassifyList(
    @Body() getTypeClassifyListDto: GetTypeClassifyListDto,
    @GetTenantId() tenantId: string
  ) {
    try {
      this.logger.log(`Getting catalog for language: ${getTypeClassifyListDto.language} and tenant: ${tenantId}`);
      const result = await this.catalogService.getTypeClassifyList(getTypeClassifyListDto, tenantId);
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
    @Body() updateCatalogDto: UpdateCatalogDto,
    @GetTenantId() tenantId: string
  ) {
    try {
      this.logger.log(`Updating catalog for language: ${language} and tenant: ${tenantId}`);
      const result = await this.catalogService.updateCatalog(language, tenantId, updateCatalogDto);
      this.logger.log('Catalog updated successfully');
      return result;
    } catch (error) {
      this.logger.error('Error updating catalog:', error);
      throw error;
    }
  }

  @Post('addRecentOrder/:productId')
  async addRecentOrder(
    @Param('productId') productId: number,
    @Body() orderData: any,
    @GetTenantId() tenantId: string
  ) {
    try {
      this.logger.log(`Adding recent order for product: ${productId} in tenant: ${tenantId}`);
      await this.catalogService.addRecentOrder(productId, tenantId, orderData);
      this.logger.log('Recent order added successfully');
      return {
        code: 0,
        message: 'Orden reciente agregada exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success'
      };
    } catch (error) {
      this.logger.error('Error adding recent order:', error);
      throw error;
    }
  }
}
