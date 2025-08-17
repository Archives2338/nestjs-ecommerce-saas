import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminServicesController } from './admin-services.controller';
import { ServicesService } from '../services/services.service';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { AdminAuthModule } from './admin-auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    AdminAuthModule
  ],
  controllers: [AdminServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class AdminServicesModule {}
