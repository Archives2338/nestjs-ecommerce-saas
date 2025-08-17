import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { ServicesModule } from './services/services.module';
import { CustomerAuthModule } from './customers/customer-auth.module';
import { OrdersModule } from './orders/orders.module';
import { AdminPaymentValidationModule } from './admin/admin-payment-validation.module';
import { AdminAuthModule } from './admin/admin-auth.module';
import { AdminServicesModule } from './admin/admin-services.module';
import { TestModule } from './test/test.module';
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
    MailerModule.forRoot({
        transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: 'alejandrojesus.2338@gmail.com',
          pass: 'jgce fkns rtmk ugug',
        },
        },
        template: {
          dir: join(__dirname, 'email', 'templates'),
          adapter: new HandlebarsAdapter({
            // Helpers de Handlebars
            formatDate: (date: string | Date) => {
              return new Date(date).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            },
            currentYear: () => new Date().getFullYear(),

          }),
          options: {
            strict: false,
          },
        }
    }),
    ConfigModule,
    CatalogModule,
    AuthModule,
    ContentModule,
    ServicesModule,
    CustomerAuthModule,
    OrdersModule,
    AdminPaymentValidationModule,
    AdminAuthModule,
    AdminServicesModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}