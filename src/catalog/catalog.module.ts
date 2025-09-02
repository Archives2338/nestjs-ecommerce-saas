import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CatalogPriceDescriptionService } from './services/catalog-price-description.service';
import { Catalog, CatalogSchema } from './schemas/catalog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Catalog.name, schema: CatalogSchema }
    ])
  ],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogPriceDescriptionService],
  exports: [CatalogService, CatalogPriceDescriptionService]
})
export class CatalogModule {}
