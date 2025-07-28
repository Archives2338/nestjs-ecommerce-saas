import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body, 
  Query, 
  Logger,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto, GetAccountsDto, AssignAccountDto } from './dto/account.dto';

@Controller('api/accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(private readonly accountsService: AccountsService) {}

  /**
   * Crear una nueva cuenta
   * POST /api/accounts
   */
  @Post()
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    try {
      this.logger.log(`Creating account for service: ${createAccountDto.service_name}`);
      return await this.accountsService.createAccount(createAccountDto);
    } catch (error) {
      this.logger.error('Error in createAccount endpoint:', error);
      return {
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Obtener cuentas con filtros
   * GET /api/accounts
   */
  @Get()
  async getAccounts(@Query() getAccountsDto: GetAccountsDto) {
    try {
      this.logger.log(`Getting accounts with filters: ${JSON.stringify(getAccountsDto)}`);
      return await this.accountsService.getAccounts(getAccountsDto);
    } catch (error) {
      this.logger.error('Error in getAccounts endpoint:', error);
      return {
        code: 1,
        message: 'Error al obtener cuentas',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Obtener cuentas disponibles para un servicio
   * GET /api/accounts/available/:service_id
   */
  @Get('available/:service_id')
  async getAvailableAccounts(@Param('service_id') serviceId: string) {
    try {
      this.logger.log(`Getting available accounts for service: ${serviceId}`);
      return await this.accountsService.getAvailableAccounts(parseInt(serviceId));
    } catch (error) {
      this.logger.error('Error in getAvailableAccounts endpoint:', error);
      return {
        code: 1,
        message: 'Error al obtener cuentas disponibles',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Obtener detalles completos de una cuenta
   * GET /api/accounts/:id/details
   */
  @Get(':id/details')
  async getAccountDetails(@Param('id') accountId: string) {
    try {
      this.logger.log(`Getting account details for: ${accountId}`);
      return await this.accountsService.getAccountDetails(accountId);
    } catch (error) {
      this.logger.error('Error in getAccountDetails endpoint:', error);
      return {
        code: 1,
        message: 'Error al obtener detalles de la cuenta',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Actualizar una cuenta
   * PUT /api/accounts/:id
   */
  @Put(':id')
  async updateAccount(
    @Param('id') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    try {
      this.logger.log(`Updating account: ${accountId}`);
      return await this.accountsService.updateAccount(accountId, updateAccountDto);
    } catch (error) {
      this.logger.error('Error in updateAccount endpoint:', error);
      return {
        code: 1,
        message: 'Error al actualizar cuenta',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Asignar cuenta a un usuario/orden
   * POST /api/accounts/:id/assign
   */
  @Post(':id/assign')
  async assignAccount(
    @Param('id') accountId: string,
    @Body() assignAccountDto: AssignAccountDto
  ) {
    try {
      this.logger.log(`Assigning account ${accountId} to user: ${assignAccountDto.user_id}`);
      return await this.accountsService.assignAccount(accountId, assignAccountDto);
    } catch (error) {
      this.logger.error('Error in assignAccount endpoint:', error);
      return {
        code: 1,
        message: 'Error al asignar cuenta',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Liberar slot de cuenta
   * POST /api/accounts/:id/release
   */
  @Post(':id/release')
  async releaseAccountSlot(
    @Param('id') accountId: string,
    @Body() body: { order_id: string }
  ) {
    try {
      this.logger.log(`Releasing slot for account ${accountId}, order: ${body.order_id}`);
      return await this.accountsService.releaseAccountSlot(accountId, body.order_id);
    } catch (error) {
      this.logger.error('Error in releaseAccountSlot endpoint:', error);
      return {
        code: 1,
        message: 'Error al liberar slot',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  /**
   * Estadísticas de cuentas por servicio
   * GET /api/accounts/stats/:service_id?
   */
  @Get('stats/:service_id?')
  async getAccountStats(@Param('service_id') serviceId?: string) {
    try {
      this.logger.log(`Getting account stats for service: ${serviceId || 'all'}`);
      
      const filter: any = {};
      if (serviceId) filter.service_id = parseInt(serviceId);

      const stats = await this.accountsService['accountModel'].aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$service_name',
            total_accounts: { $sum: 1 },
            available_accounts: {
              $sum: {
                $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
              }
            },
            assigned_accounts: {
              $sum: {
                $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0]
              }
            },
            total_slots: { $sum: '$slot_info.max_slots' },
            used_slots: { $sum: '$slot_info.used_slots' },
            available_slots: {
              $sum: {
                $subtract: ['$slot_info.max_slots', '$slot_info.used_slots']
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        code: 0,
        message: 'Estadísticas obtenidas exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: stats
      };

    } catch (error) {
      this.logger.error('Error in getAccountStats endpoint:', error);
      return {
        code: 1,
        message: 'Error al obtener estadísticas',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }
}
