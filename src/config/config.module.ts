import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { SiteConfig, SiteConfigSchema } from './schemas/site-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SiteConfig.name, schema: SiteConfigSchema }
    ])
  ],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class ConfigModule {}
