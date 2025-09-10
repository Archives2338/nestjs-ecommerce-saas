import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminServicesController } from './admin-services.controller';
import { ServicesService } from '../services/services.service';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { AdminAuthModule } from './admin-auth.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    AdminAuthModule,
    FilesModule
  ],
  controllers: [AdminServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class AdminServicesModule {}
