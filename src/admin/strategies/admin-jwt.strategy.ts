import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminAuthService } from '../admin-auth.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private adminAuthService: AdminAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ADMIN_JWT_SECRET || 'admin-super-secret-key',
    });
  }

  async validate(payload: any) {
    const admin = await this.adminAuthService.findById(payload.sub);
    if (!admin) {
      return null;
    }
    
    return {
      sub: payload.sub,
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      permissions: payload.permissions
    };
  }
}
