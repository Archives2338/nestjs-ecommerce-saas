import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsageController } from './usage.controller';
import { UsageService } from '../common/services/usage.service';
import { TenantModule } from '../tenant/tenant.module';
import { Catalog, CatalogSchema } from '../catalog/schemas/catalog.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    TenantModule,
    MongooseModule.forFeature([
      { name: Catalog.name, schema: CatalogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
