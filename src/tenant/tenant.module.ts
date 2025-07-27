import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantService } from './tenant.service';
import { TenantMiddleware } from './tenant.middleware';
import { TenantManagementService } from './tenant-management.service';
import { TenantManagementController } from './tenant-management.controller';
import { Tenant, TenantSchema } from './schemas/tenant.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema }
    ])
  ],
  controllers: [TenantManagementController],
  providers: [TenantService, TenantManagementService],
  exports: [TenantService, TenantManagementService],
})
export class TenantModule {}
