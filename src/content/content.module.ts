import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { WebpageContent, WebpageContentSchema } from './schemas/webpage-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebpageContent.name, schema: WebpageContentSchema }
    ])
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService]
})
export class ContentModule {}
