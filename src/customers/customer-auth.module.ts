import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { VerificationCode, VerificationCodeSchema } from '../auth/schemas/verification-code.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    // Schema de clientes y códigos de verificación
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema }
    ]),
    
    // JWT para tokens de autenticación
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'customer-auth-secret-key',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' 
        },
      }),
      inject: [ConfigService],
    }),

    // Módulo de email para verificaciones
    EmailModule,
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService],
  exports: [CustomerAuthService], // Exportar para usar en otros módulos
})
export class CustomerAuthModule {}
