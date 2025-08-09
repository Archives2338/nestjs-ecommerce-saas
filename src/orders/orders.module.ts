import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { OcrService } from './ocr.service';
import { CustomerJwtStrategy } from './customer-jwt.strategy';
import { CustomerAuthModule } from '../customers/customer-auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Service.name, schema: ServiceSchema }
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => CustomerAuthModule)
  ],
  providers: [OrdersService, OcrService, CustomerJwtStrategy],
  controllers: [OrdersController],
  exports: [OrdersService]
})
export class OrdersModule {}
