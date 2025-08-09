import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { Account, AccountDocument } from '../services/schemas/account.schema';
import { AccountsService } from '../services/accounts.service';
import { ValidatePaymentDto, RejectPaymentDto, GetPendingPaymentsDto, PaymentValidationResponseDto } from './dto/admin-payment-validation.dto';

@Injectable()
export class AdminPaymentValidationService {
  private readonly logger = new Logger(AdminPaymentValidationService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private accountsService: AccountsService,
  ) {}

  /**
   * 📋 Obtener comprobantes pendientes de validación
   */
  async getPendingPayments(filters?: GetPendingPaymentsDto) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      // Filtros
      const query: any = {
        ostatus: 3, // Estado "verificando"
        comprobanteUrl: { $exists: true },
        paymentAmount: { $exists: true }
      };

      if (filters?.paymentMethod) {
        query.paymentMethod = filters.paymentMethod;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      const orders = await this.orderModel
        .find(query)
        .populate('customer', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.orderModel.countDocuments(query);

      const pendingPayments: PaymentValidationResponseDto[] = orders.map(order => ({
        orderId: order._id.toString(),
        customerEmail: (order.customer as any)?.email || 'N/A',
        serviceName: order.service_name || 'N/A',
        planName: order.plan_name || 'N/A',
        paymentMethod: order.paymentMethod || 'N/A',
        paymentAmount: order.paymentAmount || 0,
        paymentReference: order.paymentReference,
        comprobanteUrl: order.comprobanteUrl,
        comprobanteOcrText: order.comprobanteOcrText,
        submittedAt: order.updatedAt || new Date(),
        status: 'pending',
        adminNotes: order.adminNotes,
        rejectionReason: order.rejectionReason,
        validatedAt: order.validatedAt,
        validatedBy: order.validatedBy
      }));

      return {
        code: 0,
        message: 'Comprobantes pendientes obtenidos exitosamente',
        data: {
          payments: pendingPayments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      this.logger.error('Error getting pending payments:', error);
      return {
        code: 1,
        message: 'Error al obtener comprobantes pendientes',
        data: null
      };
    }
  }

  /**
   * ✅ Aprobar comprobante y asignar credenciales automáticamente
   */
  async approvePayment(orderId: string, validateDto: ValidatePaymentDto) {
    try {
      const order = await this.orderModel.findById(orderId)
        .populate('customer', 'email firstName lastName')
        .exec();

      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      if (order.ostatus !== 3) {
        throw new ConflictException('Solo se pueden validar órdenes en estado "verificando"');
      }

      // 1. Actualizar estado de la orden a "pagado"
      order.ostatus = 2; // Estado "pagado"
      order.order_status = OrderStatus.PAID;
      order.adminNotes = validateDto.adminNotes;
      order.validatedAt = new Date();
      order.validatedBy = validateDto.adminId || 'admin';

      // 2. Asignar credenciales automáticamente si está habilitado
      let assignedCredentials = null;
      if (validateDto.autoAssignCredentials !== false) {
        try {
          // Buscar cuenta disponible para el servicio
          const availableAccounts = await this.accountsService.getAvailableAccounts(order.type_id);
          
          if (availableAccounts.code === 0 && availableAccounts.data && availableAccounts.data.length > 0) {
            const targetAccount = availableAccounts.data[0];
            
            // Asignar cuenta usando el servicio existente
            const assignmentResult = await this.accountsService.assignAccount(
              targetAccount.id,
              {
                user_id: (order.customer as any)._id?.toString() || order.user_id,
                order_id: order.out_trade_no,
                profile_name: `Perfil ${(order.customer as any)?.firstName || 'Usuario'}`
              }
            );

            if (assignmentResult.code === 0 && assignmentResult.data) {
              assignedCredentials = {
                email: assignmentResult.data.email,
                password: assignmentResult.data.password,
                profileName: assignmentResult.data.profile_name,
                accountId: assignmentResult.data.account_id
              };

              this.logger.log(`✅ Credenciales asignadas automáticamente para orden ${orderId}`);
            } else {
              this.logger.warn(`⚠️ No se pudieron asignar credenciales automáticamente: ${assignmentResult.message}`);
            }
          } else {
            this.logger.warn(`⚠️ No hay cuentas disponibles para el servicio tipo ${order.type_id}`);
          }
        } catch (assignError) {
          this.logger.error('Error en asignación automática de credenciales:', assignError);
          // Continuamos sin asignación automática
        }
      }

      await order.save();

      // TODO: Enviar notificación al cliente (TODO: implementar email service)
      this.logger.log(`📧 TODO: Enviar notificación de aprobación a ${(order.customer as any)?.email}`);

      return {
        code: 0,
        message: 'Comprobante aprobado exitosamente',
        data: {
          orderId: order._id,
          orderNumber: order.out_trade_no,
          customerEmail: (order.customer as any)?.email,
          status: 'approved',
          approvedAt: order.validatedAt,
          approvedBy: order.validatedBy,
          assignedCredentials,
          message: assignedCredentials 
            ? 'Pago aprobado y credenciales asignadas automáticamente'
            : 'Pago aprobado. Credenciales deben asignarse manualmente.'
        }
      };

    } catch (error) {
      this.logger.error('Error approving payment:', error);
      
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        return {
          code: 1,
          message: error.message,
          data: null
        };
      }

      return {
        code: 1,
        message: 'Error al aprobar comprobante',
        data: null
      };
    }
  }

  /**
   * ❌ Rechazar comprobante de pago
   */
  async rejectPayment(orderId: string, rejectDto: RejectPaymentDto) {
    try {
      const order = await this.orderModel.findById(orderId)
        .populate('customer', 'email firstName lastName')
        .exec();

      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      if (order.ostatus !== 3) {
        throw new ConflictException('Solo se pueden rechazar órdenes en estado "verificando"');
      }

      // Actualizar estado de la orden a "cancelado"
      order.ostatus = 5; // Estado "cancelado"
      order.order_status = OrderStatus.REJECTED;
      order.rejectionReason = rejectDto.rejectionReason;
      order.adminNotes = rejectDto.adminNotes;
      order.validatedAt = new Date();
      order.validatedBy = rejectDto.adminId || 'admin';

      await order.save();

      // TODO: Enviar notificación al cliente
      this.logger.log(`📧 TODO: Enviar notificación de rechazo a ${(order.customer as any)?.email}`);

      return {
        code: 0,
        message: 'Comprobante rechazado exitosamente',
        data: {
          orderId: order._id,
          orderNumber: order.out_trade_no,
          customerEmail: (order.customer as any)?.email,
          status: 'rejected',
          rejectionReason: rejectDto.rejectionReason,
          rejectedAt: order.validatedAt,
          rejectedBy: order.validatedBy
        }
      };

    } catch (error) {
      this.logger.error('Error rejecting payment:', error);
      
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        return {
          code: 1,
          message: error.message,
          data: null
        };
      }

      return {
        code: 1,
        message: 'Error al rechazar comprobante',
        data: null
      };
    }
  }

  /**
   * 🔍 Obtener detalles completos de un comprobante
   */
  async getPaymentDetails(orderId: string) {
    try {
      const order = await this.orderModel.findById(orderId)
        .populate('customer', 'email firstName lastName phone')
        .exec();

      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      return {
        code: 0,
        message: 'Detalles del comprobante obtenidos exitosamente',
        data: {
          order: {
            id: order._id,
            orderNumber: order.out_trade_no,
            serviceName: order.service_name,
            planName: order.plan_name,
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentAmount: order.paymentAmount,
            paymentReference: order.paymentReference,
            status: order.ostatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          },
          customer: {
            email: (order.customer as any)?.email,
            name: `${(order.customer as any)?.firstName || ''} ${(order.customer as any)?.lastName || ''}`.trim(),
            phone: (order.customer as any)?.phone
          },
          comprobante: {
            url: order.comprobanteUrl,
            ocrText: order.comprobanteOcrText,
            uploadedAt: order.updatedAt
          },
          validation: {
            status: order.ostatus === 2 ? 'approved' : order.ostatus === 5 ? 'rejected' : 'pending',
            adminNotes: order.adminNotes,
            rejectionReason: order.rejectionReason,
            validatedAt: order.validatedAt,
            validatedBy: order.validatedBy
          },
          accessInfo: order.access_info
        }
      };

    } catch (error) {
      this.logger.error('Error getting payment details:', error);
      
      if (error instanceof NotFoundException) {
        return {
          code: 1,
          message: error.message,
          data: null
        };
      }

      return {
        code: 1,
        message: 'Error al obtener detalles del comprobante',
        data: null
      };
    }
  }

  /**
   * 📊 Estadísticas de validaciones
   */
  async getValidationStats() {
    try {
      const stats = await this.orderModel.aggregate([
        {
          $match: {
            comprobanteUrl: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$ostatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$paymentAmount' }
          }
        }
      ]);

      const pending = stats.find(s => s._id === 3) || { count: 0, totalAmount: 0 };
      const approved = stats.find(s => s._id === 2) || { count: 0, totalAmount: 0 };
      const rejected = stats.find(s => s._id === 5) || { count: 0, totalAmount: 0 };

      return {
        code: 0,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          pending: {
            count: pending.count,
            totalAmount: pending.totalAmount
          },
          approved: {
            count: approved.count,
            totalAmount: approved.totalAmount
          },
          rejected: {
            count: rejected.count,
            totalAmount: rejected.totalAmount
          },
          total: {
            count: pending.count + approved.count + rejected.count,
            totalAmount: pending.totalAmount + approved.totalAmount + rejected.totalAmount
          }
        }
      };

    } catch (error) {
      this.logger.error('Error getting validation stats:', error);
      return {
        code: 1,
        message: 'Error al obtener estadísticas',
        data: null
      };
    }
  }

  /**
   * 🔄 Re-procesar asignación de credenciales
   */
  async retryCredentialAssignment(orderId: string) {
    try {
      const order = await this.orderModel.findById(orderId)
        .populate('customer', 'email firstName lastName')
        .exec();

      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      if (order.ostatus !== 2) {
        throw new ConflictException('Solo se pueden asignar credenciales a órdenes aprobadas');
      }

      if (order.access_info?.account_id) {
        throw new ConflictException('Esta orden ya tiene credenciales asignadas');
      }

      // Buscar cuenta disponible y asignar
      const availableAccounts = await this.accountsService.getAvailableAccounts(order.type_id);
      
      if (availableAccounts.code !== 0 || !availableAccounts.data?.length) {
        return {
          code: 1,
          message: 'No hay cuentas disponibles para este servicio',
          data: null
        };
      }

      const targetAccount = availableAccounts.data[0];
      
      const assignmentResult = await this.accountsService.assignAccount(
        targetAccount.id,
        {
          user_id: (order.customer as any)?._id?.toString() || order.user_id,
          order_id: order.out_trade_no,
          profile_name: `Perfil ${(order.customer as any)?.firstName || 'Usuario'}`
        }
      );

      if (assignmentResult.code === 0 && assignmentResult.data) {
        return {
          code: 0,
          message: 'Credenciales asignadas exitosamente',
          data: {
            orderId: order._id,
            orderNumber: order.out_trade_no,
            assignedCredentials: {
              email: assignmentResult.data.email,
              password: assignmentResult.data.password,
              profileName: assignmentResult.data.profile_name,
              accountId: assignmentResult.data.account_id
            }
          }
        };
      } else {
        return {
          code: 1,
          message: `Error en asignación: ${assignmentResult.message}`,
          data: null
        };
      }

    } catch (error) {
      this.logger.error('Error retrying credential assignment:', error);
      
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        return {
          code: 1,
          message: error.message,
          data: null
        };
      }

      return {
        code: 1,
        message: 'Error al asignar credenciales',
        data: null
      };
    }
  }
}
