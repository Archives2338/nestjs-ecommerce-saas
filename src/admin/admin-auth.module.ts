import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminContentController } from './admin-content.controller';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminPermissionGuard } from './guards/admin-permission.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.ADMIN_JWT_SECRET || 'admin-super-secret-key',
      signOptions: { 
        expiresIn: '24h' // Los admins pueden tener sesiones más largas
      },
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminContentController,
  ],
  providers: [
    AdminAuthService,
    AdminJwtStrategy,
    AdminLocalStrategy,
    AdminJwtAuthGuard,
    AdminPermissionGuard
  ],
  exports: [
    AdminAuthService,
    AdminJwtAuthGuard,
    AdminPermissionGuard
  ],
})
export class AdminAuthModule {}
