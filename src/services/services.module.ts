import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Service, ServiceSchema } from './schemas/service.schema';
import { Account, AccountSchema } from './schemas/account.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Catalog, CatalogSchema } from '../catalog/schemas/catalog.schema';
import { AdminAuthModule } from '../admin/admin-auth.module';

// Nuevos schemas modulares
import { 
  ServiceMonthOption, 
  ServiceMonthOptionSchema,
  ServiceScreenOption,
  ServiceScreenOptionSchema,
  ServicePlan,
  ServicePlanSchema
} from './schemas-new';

// Nuevos servicios modulares
import {
  ServiceMonthOptionService,
  ServiceScreenOptionService,
  ServicePlanService,
  ServicePricingIntegrationService
} from './services';

// Servicio de sincronización con catálogos
import { ServiceCatalogSyncService } from './services/service-catalog-sync.service';

// Servicio de eventos
import { ServiceEventsService } from './services/service-events.service';

// Nuevos controladores admin
import {
  AdminMonthOptionsController,
  AdminScreenOptionsController,
  AdminServicePlansController,
  AdminServicePricingController
} from './controllers';

// Controlador de sincronización admin
import { AdminSyncController } from './controllers/admin-sync.controller';

@Module({
  imports: [
    AdminAuthModule, // Importar AdminAuthModule para acceso a AdminAuthService
    MongooseModule.forFeature([
      // Schemas originales
      { name: Service.name, schema: ServiceSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Catalog.name, schema: CatalogSchema }, // Para ServiceCatalogSyncService
      
      // Nuevos schemas modulares
      { 
        name: ServiceMonthOption.name, 
        schema: ServiceMonthOptionSchema,
        collection: 'service_month_options'
      },
      { 
        name: ServiceScreenOption.name, 
        schema: ServiceScreenOptionSchema,
        collection: 'service_screen_options'
      },
      { 
        name: ServicePlan.name, 
        schema: ServicePlanSchema,
        collection: 'service_plans'
      }
    ])
  ],
  controllers: [
    // Controladores originales
    ServicesController, 
    AccountsController,
    
    // Nuevos controladores admin
    AdminMonthOptionsController,
    AdminScreenOptionsController,
    AdminServicePlansController,
    AdminServicePricingController,
    
    // Controlador de sincronización
    AdminSyncController
  ],
  providers: [
    // Servicios originales
    ServicesService, 
    AccountsService,
    
    // Nuevos servicios modulares
    ServiceMonthOptionService,
    ServiceScreenOptionService,
    ServicePlanService,
    ServicePricingIntegrationService,
    
    // Servicio de sincronización con catálogos
    ServiceCatalogSyncService,
    
    // Servicio de eventos
    ServiceEventsService
  ],
  exports: [
    // Servicios originales
    ServicesService, 
    AccountsService,
    
    // Nuevos servicios modulares
    ServiceMonthOptionService,
    ServiceScreenOptionService,
    ServicePlanService,
    ServicePricingIntegrationService,
    
    // Servicio de sincronización con catálogos
    ServiceCatalogSyncService,
    
    // Servicio de eventos
    ServiceEventsService
  ]
})
export class ServicesModule {}
