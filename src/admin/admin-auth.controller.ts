import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  Get,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, AdminRefreshTokenDto } from './dto/admin-auth.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { AdminAuthenticatedRequest, AdminLocalAuthRequest } from './interfaces/admin-request.interface';

@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  /**
   * 🔐 Login de administrador
   * POST /api/admin/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('admin-local'))
  async login(@Request() req: AdminLocalAuthRequest, @Body() loginDto: AdminLoginDto) {
    try {
      const result = await this.adminAuthService.login(req.user);
      
      return {
        success: true,
        message: 'Login exitoso',
        data: {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          user: {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email,
            role: result.user.role,
            permissions: result.user.permissions,
            lastLogin: new Date(),
            isActive: result.user.isActive
          },
          expiresIn: result.expiresIn
        }
      };
    } catch (error) {
      throw new UnauthorizedException({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      });
    }
  }

  /**
   * 🔄 Refresh token
   * POST /api/admin/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshDto: AdminRefreshTokenDto) {
    try {
      const result = await this.adminAuthService.refreshToken(refreshDto.refresh_token);
      
      return {
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expiresIn: result.expiresIn
        }
      };
    } catch (error) {
      throw new UnauthorizedException({
        success: false,
        message: 'Token de refresh inválido',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }
  }

  /**
   * 👤 Obtener perfil del admin autenticado
   * GET /api/admin/auth/profile
   */
  @Get('profile')
  @UseGuards(AuthGuard('admin-jwt'))
  async getProfile(@Request() req: AdminAuthenticatedRequest) {
    const admin = await this.adminAuthService.getAdminProfile(req.user.sub);
    
    return {
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    };
  }

  /**
   * 🚪 Logout del administrador
   * POST /api/admin/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('admin-jwt'))
  async logout(@Request() req: AdminAuthenticatedRequest) {
    await this.adminAuthService.logout(req.user.sub);
    
    return {
      success: true,
      message: 'Logout exitoso'
    };
  }

  /**
   * ✅ Verificar si el token es válido
   * GET /api/admin/auth/verify
   */
  @Get('verify')
  @UseGuards(AuthGuard('admin-jwt'))
  async verifyToken(@Request() req: AdminAuthenticatedRequest) {
    return {
      success: true,
      message: 'Token válido',
      data: {
        userId: req.user.sub,
        username: req.user.username,
        role: req.user.role,
        permissions: req.user.permissions
      }
    };
  }

  /**
   * 🔐 Cambiar contraseña (requiere contraseña actual)
   * POST /api/admin/auth/change-password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('admin-jwt'))
  async changePassword(@Request() req: AdminAuthenticatedRequest, @Body() changePasswordDto: AdminChangePasswordDto) {
    await this.adminAuthService.changePassword(
      req.user.sub, 
      changePasswordDto.currentPassword, 
      changePasswordDto.newPassword
    );
    
    return {
      success: true,
      message: 'Contraseña cambiada exitosamente'
    };
  }
}
