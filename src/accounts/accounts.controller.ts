import { Get, Param, Put } from '@nestjs/common';
  
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ServiceAccount } from './schemas/service-account.schema';

@Controller('api/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

/**
   * Listar todas las cuentas de servicio
   * GET /api/accounts
   */
  @Get()
  async listServiceAccounts() {
    const accounts = await this.accountsService['accountModel'].find();
    return {
      code: 0,
      message: 'Cuentas encontradas',
      data: accounts
    };
  }

  /**
   * Editar cuenta de servicio (correo, clave, perfiles)
   * PUT /api/accounts/:id
   */
  @Put(':id')
  async updateServiceAccount(
    @Param('id') id: string,
    @Body() body: Partial<{ email: string; password: string; profiles: any[] }>
  ) {
    const updated = await this.accountsService['accountModel'].findByIdAndUpdate(id, body, { new: true });
    return {
      code: updated ? 0 : 1,
      message: updated ? 'Cuenta actualizada' : 'Cuenta no encontrada',
      data: updated
    };
  }

  /**
   * Crear cuenta de servicio con perfiles
   * POST /api/accounts
   * Body: { email, password, service, profiles: [{ profileId }] }
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async createServiceAccount(@Body() body: {
    email: string;
    password: string;
    service: string;
    profiles: { profileId: string }[];
  }): Promise<{ code: number; message: string; data?: ServiceAccount }> {
    // Inicializa los perfiles como disponibles
    const profiles = body.profiles.map(p => ({
      profileId: p.profileId,
      status: 'disponible',
      assignedTo: null,
      expiresAt: null
    }));
    const created = await this.accountsService['accountModel'].create({
      email: body.email,
      password: body.password,
      service: body.service,
      profiles
    });
    return {
      code: 0,
      message: 'Cuenta creada',
      data: created
    };
  }
}
