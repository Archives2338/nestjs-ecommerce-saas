import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { GamsGoEmailService } from './email.service.example';
import { ModernEmailService } from './modern-email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [
    EmailService, // Legacy service
    GamsGoEmailService, // Custom service con nodemailer
    ModernEmailService // Nuevo servicio con @nestjs-modules/mailer
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hacer el módulo de configuración global
    }),
  ],
  exports: [
    EmailService, 
    GamsGoEmailService, 
    ModernEmailService
  ],
})
export class EmailModule {}
