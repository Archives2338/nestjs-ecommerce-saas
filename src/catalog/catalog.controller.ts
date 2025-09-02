import { Controller, Post, Body, Put, Param, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogPriceDescriptionService } from './services/catalog-price-description.service';
import { GetTypeClassifyListDto, UpdateCatalogDto } from './dto/catalog.dto';

@Controller('index')
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);
  
  constructor(
    private readonly catalogService: CatalogService,
    private readonly catalogPriceDescriptionService: CatalogPriceDescriptionService
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

  @Post('addRecentOrder/:productId')
  @HttpCode(HttpStatus.OK)
  async addRecentOrder(
    @Param('productId') productId: number,
    @Body() orderData: any
  ) {
    try {
      this.logger.log(`Adding recent order for product: ${productId}`);
      await this.catalogService.addRecentOrder(productId, orderData);
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

  @Put('service/:language/:serviceId/price-description')
  async updateServicePriceAndDescription(
    @Param('language') language: string,
    @Param('serviceId') serviceId: number,
    @Body() updateData: any
  ) {
    try {
      this.logger.log(`Updating service ${serviceId} price and description for language: ${language}`);
      console.log(`data: ${updateData.description}`);
      const result = await this.catalogPriceDescriptionService.updateServicePriceAndDescription(
        language,
        serviceId,
        updateData.min_price,
        updateData.description
      );
      this.logger.log('Service price and description updated successfully');
      return result;
    } catch (error) {
      this.logger.error('Error updating service price and description:', error);
      throw error;
    }
  }
}
