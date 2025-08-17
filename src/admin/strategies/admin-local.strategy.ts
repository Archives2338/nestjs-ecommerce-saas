import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminAuthService } from '../admin-auth.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy, 'admin-local') {
  constructor(private adminAuthService: AdminAuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const admin = await this.adminAuthService.validateAdmin(username, password);
    if (!admin) {
      throw new UnauthorizedException('Credenciales de administrador inválidas');
    }
    return admin;
  }
}
