import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { ServicesModule } from './services/services.module';
import { CustomerAuthModule } from './customers/customer-auth.module';
import { OrdersModule } from './orders/orders.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    ConfigModule,
    CatalogModule,
    AuthModule,
    ContentModule,
    ServicesModule,
    CustomerAuthModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}