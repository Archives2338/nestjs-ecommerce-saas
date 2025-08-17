import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Interfaz para el administrador
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'editor';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  refreshTokens?: string[];
}

@Injectable()
export class AdminAuthService {
  // Base de datos simulada de administradores
  private readonly admins: AdminUser[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@empresa.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'super_admin',
      permissions: [
        'content:create', 'content:read', 'content:update', 'content:delete',
        'characteristics:create', 'characteristics:read', 'characteristics:update', 'characteristics:delete',
        'services:create', 'services:read', 'services:update', 'services:delete',
        'users:read', 'users:update', 'users:delete',
        'payments:validate', 'payments:reject',
        'admin:create', 'admin:read', 'admin:update', 'admin:delete'
      ],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      refreshTokens: []
    },
    {
      id: '2',
      username: 'editor',
      email: 'editor@empresa.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'editor',
      permissions: [
        'content:create', 'content:read', 'content:update',
        'characteristics:create', 'characteristics:read', 'characteristics:update',
        'services:read', 'services:update'
      ],
      isActive: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      refreshTokens: []
    },
    {
      id: '3',
      username: 'moderator',
      email: 'moderator@empresa.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      permissions: [
        'content:read', 'content:update',
        'characteristics:read',
        'services:read',
        'payments:validate', 'payments:reject'
      ],
      isActive: true,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
      refreshTokens: []
    }
  ];

  constructor(private readonly jwtService: JwtService) {}

  /**
   * 🔐 Validar credenciales de administrador
   */
  async validateAdmin(username: string, password: string): Promise<any> {
    const admin = this.admins.find(a => a.username === username && a.isActive);
    
    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    admin.lastLogin = new Date();

    const { password: _, ...result } = admin;
    return result;
  }

  /**
   * 🎟️ Generar tokens JWT
   */
  async login(admin: any) {
    const payload = { 
      username: admin.username, 
      sub: admin.id, 
      role: admin.role,
      permissions: admin.permissions
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Guardar refresh token
    const adminUser = this.admins.find(a => a.id === admin.id);
    if (adminUser) {
      if (!adminUser.refreshTokens) adminUser.refreshTokens = [];
      adminUser.refreshTokens.push(refreshToken);
      // Mantener solo los últimos 5 refresh tokens
      if (adminUser.refreshTokens.length > 5) {
        adminUser.refreshTokens.shift();
      }
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: admin,
      expiresIn: 24 * 60 * 60 // 24 horas en segundos
    };
  }

  /**
   * 🔄 Renovar token de acceso
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const admin = this.admins.find(a => a.id === decoded.sub && a.isActive);

      if (!admin || !admin.refreshTokens?.includes(refreshToken)) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const payload = { 
        username: admin.username, 
        sub: admin.id, 
        role: admin.role,
        permissions: admin.permissions
      };

      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Reemplazar el refresh token anterior
      const tokenIndex = admin.refreshTokens.indexOf(refreshToken);
      admin.refreshTokens[tokenIndex] = newRefreshToken;

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expiresIn: 24 * 60 * 60
      };

    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  /**
   * 👤 Obtener perfil del administrador
   */
  async getAdminProfile(adminId: string) {
    const admin = this.admins.find(a => a.id === adminId && a.isActive);
    
    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }

    const { password, refreshTokens, ...profile } = admin;
    return profile;
  }

  /**
   * 🚪 Logout - invalidar refresh tokens
   */
  async logout(adminId: string) {
    const admin = this.admins.find(a => a.id === adminId);
    if (admin) {
      admin.refreshTokens = [];
    }
  }

  /**
   * 🔐 Cambiar contraseña
   */
  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = this.admins.find(a => a.id === adminId && a.isActive);
    
    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    admin.updatedAt = new Date();
    
    // Invalidar todos los refresh tokens por seguridad
    admin.refreshTokens = [];
  }

  /**
   * 👥 Obtener todos los administradores (solo para super_admin)
   */
  async getAllAdmins() {
    return this.admins.map(admin => {
      const { password, refreshTokens, ...adminData } = admin;
      return adminData;
    });
  }

  /**
   * ➕ Crear nuevo administrador
   */
  async createAdmin(adminData: any) {
    const existingAdmin = this.admins.find(
      a => a.username === adminData.username || a.email === adminData.email
    );

    if (existingAdmin) {
      throw new ConflictException('Username o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    const newAdmin: AdminUser = {
      id: (this.admins.length + 1).toString(),
      username: adminData.username,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      permissions: adminData.permissions || this.getDefaultPermissions(adminData.role),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      refreshTokens: []
    };

    this.admins.push(newAdmin);

    const { password, refreshTokens, ...result } = newAdmin;
    return result;
  }

  /**
   * 🔧 Obtener permisos por defecto según el rol
   */
  private getDefaultPermissions(role: string): string[] {
    switch (role) {
      case 'super_admin':
        return [
          'content:create', 'content:read', 'content:update', 'content:delete',
          'characteristics:create', 'characteristics:read', 'characteristics:update', 'characteristics:delete',
          'services:create', 'services:read', 'services:update', 'services:delete',
          'users:read', 'users:update', 'users:delete',
          'payments:validate', 'payments:reject',
          'admin:create', 'admin:read', 'admin:update', 'admin:delete'
        ];
      case 'admin':
        return [
          'content:read', 'content:update',
          'characteristics:read',
          'services:read',
          'payments:validate', 'payments:reject'
        ];
      case 'editor':
        return [
          'content:create', 'content:read', 'content:update',
          'characteristics:create', 'characteristics:read', 'characteristics:update',
          'services:read', 'services:update'
        ];
      default:
        return ['content:read'];
    }
  }

  /**
   * ✅ Verificar si el admin tiene un permiso específico
   */
  hasPermission(adminId: string, permission: string): boolean {
    const admin = this.admins.find(a => a.id === adminId && a.isActive);
    return admin ? admin.permissions.includes(permission) : false;
  }

  /**
   * 🔍 Buscar administrador por ID
   */
  async findById(id: string) {
    const admin = this.admins.find(a => a.id === id && a.isActive);
    if (!admin) return null;
    
    const { password, refreshTokens, ...result } = admin;
    return result;
  }
}
