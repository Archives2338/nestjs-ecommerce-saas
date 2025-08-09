import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument, AccountStatus, AccountType } from './schemas/account.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema'; // Cambio aquí
import { CreateAccountDto, UpdateAccountDto, GetAccountsDto, AssignAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>, // Agregar Order model
  ) {}

  /**
   * Crear una nueva cuenta
   * POST /api/accounts
   */
  async createAccount(createAccountDto: CreateAccountDto, adminId?: string) {
    try {
      this.logger.log(`Creating account for service: ${createAccountDto.service_name}`);

      // Verificar si ya existe una cuenta con el mismo email
      const existingAccount = await this.accountModel.findOne({
        'credentials.email': createAccountDto.credentials.email,
        service_id: createAccountDto.service_id
      }).exec();

      if (existingAccount) {
        throw new ConflictException('Ya existe una cuenta con este email para este servicio');
      }

      const newAccount = new this.accountModel({
        ...createAccountDto,
        status: AccountStatus.AVAILABLE,
        slot_info: {
          ...createAccountDto.slot_info,
          used_slots: 0,
          assigned_to: []
        },
        created_by: adminId
      });

      const savedAccount = await newAccount.save();

      return {
        code: 0,
        message: 'Cuenta creada exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          id: savedAccount._id,
          service_name: savedAccount.service_name,
          account_type: savedAccount.account_type,
          status: savedAccount.status,
          plan_type: savedAccount.plan_type,
          max_slots: savedAccount.slot_info.max_slots,
          used_slots: savedAccount.slot_info.used_slots,
          expires_at: savedAccount.subscription_expires_at
        }
      };

    } catch (error) {
      this.logger.error('Error creating account:', error);
      
      if (error instanceof ConflictException) {
        return {
          code: 1,
          message: error.message,
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      return {
        code: 1,
        message: 'Error al crear cuenta',
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
  async getAccounts(getAccountsDto: GetAccountsDto) {
    try {
      const { service_id, service_name, status, account_type, page = 1, limit = 10 } = getAccountsDto;
      
      const filter: any = {};
      if (service_id) filter.service_id = service_id;
      if (service_name) filter.service_name = service_name;
      if (status) filter.status = status;
      if (account_type) filter.account_type = account_type;

      const skip = (page - 1) * limit;

      const [accounts, total] = await Promise.all([
        this.accountModel
          .find(filter)
          .select('-credentials.password -credentials.recovery_codes') // Excluir datos sensibles
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.accountModel.countDocuments(filter)
      ]);

      return {
        code: 0,
        message: 'Cuentas obtenidas exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          accounts: accounts.map(account => ({
            id: account._id,
            service_id: account.service_id,
            service_name: account.service_name,
            account_type: account.account_type,
            status: account.status,
            plan_type: account.plan_type,
            email: account.credentials.email,
            profile_name: account.credentials.profile_name,
            max_slots: account.slot_info.max_slots,
            used_slots: account.slot_info.used_slots,
            available_slots: account.slot_info.max_slots - account.slot_info.used_slots,
            expires_at: account.subscription_expires_at,
            last_login_check: account.last_login_check,
            notes: account.notes,
            created_at: account.created_at
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      this.logger.error('Error getting accounts:', error);
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
   * Obtener cuentas disponibles para un servicio específico
   * GET /api/accounts/available/:service_id
   */
  async getAvailableAccounts(serviceId: number) {
    try {
      const accounts = await this.accountModel
        .find({
          service_id: serviceId,
          status: AccountStatus.AVAILABLE,
          $expr: { $lt: ['$slot_info.used_slots', '$slot_info.max_slots'] }
        })
        .select('-credentials.password -credentials.recovery_codes')
        .sort({ 'slot_info.used_slots': 1 }) // Priorizar cuentas con menos slots usados
        .exec();

      return {
        code: 0,
        message: 'Cuentas disponibles obtenidas exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: accounts.map(account => ({
          id: account._id,
          service_name: account.service_name,
          account_type: account.account_type,
          plan_type: account.plan_type,
          available_slots: account.slot_info.max_slots - account.slot_info.used_slots,
          expires_at: account.subscription_expires_at
        }))
      };

    } catch (error) {
      this.logger.error('Error getting available accounts:', error);
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
   * Obtener detalles completos de una cuenta (solo para admins)
   * GET /api/accounts/:id/details
   */
  async getAccountDetails(accountId: string) {
    try {
      const account = await this.accountModel
        .findById(accountId)
        .select('+credentials.email +credentials.password +credentials.recovery_codes') // Incluir datos sensibles
        .exec();

      if (!account) {
        throw new NotFoundException('Cuenta no encontrada');
      }

      return {
        code: 0,
        message: 'Detalles de cuenta obtenidos exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          id: account._id,
          service_id: account.service_id,
          service_name: account.service_name,
          account_type: account.account_type,
          status: account.status,
          credentials: account.credentials,
          slot_info: account.slot_info,
          plan_type: account.plan_type,
          expires_at: account.subscription_expires_at,
          last_login_check: account.last_login_check,
          notes: account.notes,
          metadata: account.metadata,
          created_at: account.created_at,
          updated_at: account.updated_at,
          created_by: account.created_by
        }
      };

    } catch (error) {
      this.logger.error('Error getting account details:', error);
      
      if (error instanceof NotFoundException) {
        return {
          code: 1,
          message: error.message,
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

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
  async updateAccount(accountId: string, updateAccountDto: UpdateAccountDto) {
    try {
      const updatedAccount = await this.accountModel
        .findByIdAndUpdate(
          accountId,
          { 
            ...updateAccountDto, 
            updated_at: new Date() 
          },
          { new: true }
        )
        .select('-credentials.password -credentials.recovery_codes')
        .exec();

      if (!updatedAccount) {
        throw new NotFoundException('Cuenta no encontrada');
      }

      return {
        code: 0,
        message: 'Cuenta actualizada exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          id: updatedAccount._id,
          service_name: updatedAccount.service_name,
          status: updatedAccount.status,
          updated_at: updatedAccount.updated_at
        }
      };

    } catch (error) {
      this.logger.error('Error updating account:', error);
      
      if (error instanceof NotFoundException) {
        return {
          code: 1,
          message: error.message,
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

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
  async assignAccount(accountId: string, assignAccountDto: AssignAccountDto) {
    try {
      // ✅ Importante: Incluir credenciales que tienen select: false
      const account = await this.accountModel
        .findById(accountId)
        .select('+credentials.email +credentials.password') // Incluir campos sensibles
        .exec();

      if (!account) {
        throw new NotFoundException('Cuenta no encontrada');
      }

      if (account.slot_info.used_slots >= account.slot_info.max_slots) {
        throw new ConflictException('La cuenta no tiene slots disponibles');
      }

      // Buscar la orden para actualizarla
      const order = await this.orderModel.findOne({ out_trade_no: assignAccountDto.order_id }).exec();
      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      // ✅ Validar que las credenciales estén disponibles
      if (!account.credentials.email || !account.credentials.password) {
        this.logger.error('Account credentials missing:', { 
          accountId, 
          hasEmail: !!account.credentials.email,
          hasPassword: !!account.credentials.password 
        });
        throw new ConflictException('Las credenciales de la cuenta están incompletas');
      }

      // Agregar asignación a la cuenta
      account.slot_info.used_slots += 1;
      account.slot_info.assigned_to.push(assignAccountDto.order_id);
      
      if (account.slot_info.used_slots >= account.slot_info.max_slots) {
        account.status = AccountStatus.ASSIGNED;
      }

      // Actualizar la orden con información de acceso
      order.access_info = {
        account_id: account._id,
        profile_name: assignAccountDto.profile_name || account.credentials.profile_name,
        slot_number: account.slot_info.used_slots,
        access_credentials: {
          email: account.credentials.email,
          password: account.credentials.password,
          profile_pin: assignAccountDto.profile_pin
        }
      };
      
      order.order_status = 'active' as any; // Cambiar estado a activo
      
      // Guardar ambos documentos
      await Promise.all([
        account.save(),
        order.save()
      ]);

      account.updated_at = new Date();
      await account.save();

      return {
        code: 0,
        message: 'Cuenta asignada exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          account_id: account._id,
          order_id: order._id,
          order_number: order.out_trade_no,
          email: account.credentials.email,
          password: account.credentials.password,
          profile_name: assignAccountDto.profile_name || account.credentials.profile_name,
          slot_number: account.slot_info.used_slots,
          expires_at: order.expires_at
        }
      };

    } catch (error) {
      this.logger.error('Error assigning account:', error);
      
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        return {
          code: 1,
          message: error.message,
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

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
  async releaseAccountSlot(accountId: string, orderId: string) {
    try {
      const account = await this.accountModel.findById(accountId).exec();

      if (!account) {
        throw new NotFoundException('Cuenta no encontrada');
      }

      const orderIndex = account.slot_info.assigned_to.indexOf(orderId);
      if (orderIndex === -1) {
        throw new NotFoundException('Orden no encontrada en esta cuenta');
      }

      // Buscar y actualizar la orden
      const order = await this.orderModel.findOne({ out_trade_no: orderId }).exec();
      if (order) {
        order.order_status = 'expired' as any; // Cambiar estado a expirado
        order.access_info = undefined; // Limpiar información de acceso
        await order.save();
      }

      // Liberar slot
      account.slot_info.assigned_to.splice(orderIndex, 1);
      account.slot_info.used_slots -= 1;
      
      if (account.slot_info.used_slots < account.slot_info.max_slots) {
        account.status = AccountStatus.AVAILABLE;
      }

      account.updated_at = new Date();
      await account.save();

      return {
        code: 0,
        message: 'Slot liberado exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          account_id: account._id,
          order_id: order?._id,
          available_slots: account.slot_info.max_slots - account.slot_info.used_slots
        }
      };

    } catch (error) {
      this.logger.error('Error releasing account slot:', error);
      
      if (error instanceof NotFoundException) {
        return {
          code: 1,
          message: error.message,
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

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
}
