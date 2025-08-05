import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomerAuthService } from '../customers/customer-auth.service';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(private customerAuthService: CustomerAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'customer-auth-secret-key', // Mismo secret que en el módulo
    });
  }

  async validate(payload: any) {
    // Validar que es un token de customer
    if (payload.type !== 'customer') {
      return null;
    }

    // Buscar el customer por ID del payload usando getProfile
    try {
      const profileResult = await this.customerAuthService.getProfile(payload.sub);
      if (profileResult.code !== 0 || !profileResult.data) {
        return null;
      }

      // Retornar los datos del usuario que se pasarán al request
      return {
        userId: payload.sub,
        email: payload.email,
        customer: profileResult.data
      };
    } catch (error) {
      return null;
    }
  }
}
