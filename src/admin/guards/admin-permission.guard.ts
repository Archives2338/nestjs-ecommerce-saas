import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminAuthService } from '../admin-auth.service';

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private adminAuthService: AdminAuthService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    
    if (!requiredPermissions) {
      return true; // Si no se especifican permisos, permite el acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some(permission => 
      user.permissions?.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        success: false,
        message: 'No tienes permisos suficientes para realizar esta acción',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredPermissions
      });
    }

    return true;
  }
}
