import { Injectable, Logger, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { VerificationCode, VerificationCodeDocument } from '../auth/schemas/verification-code.schema';
import { OrdersService } from '../orders/orders.service';
import { 
  RegisterCustomerDto, 
  LoginCustomerDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  VerifyEmailDto,
  UpdateCustomerProfileDto,
  ChangePasswordDto,
  CustomerAuthResponse,
  CheckEmailDto,
  VerifyCodeDto,
  CompleteRegistrationDto,
  OrderHistoryDto
} from './dto/customer-auth.dto';

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(VerificationCode.name) private verificationCodeModel: Model<VerificationCodeDocument>,
    private jwtService: JwtService,
    private ordersService: OrdersService,
  ) {}

  /**
   * NUEVO FLUJO: Paso 1 - Verificar email
   */
  async checkEmail(checkEmailDto: CheckEmailDto): Promise<CustomerAuthResponse> {
    try {
      const { email } = checkEmailDto;
      this.logger.log(`Checking email and sending verification code: ${email}`);
      // Verificar si el email ya existe
      const existingCustomer = await this.customerModel.findOne({ 
        email: email.toLowerCase() 
      });

      if (existingCustomer) {
        // Si ya existe, redirigir a login
        return {
          code: 1,
          message: 'El email ya está registrado. Por favor inicia sesión.',
          toast: 1,
          redirect_url: '/login',
          type: 'info',
          data: { emailExists: true }
        };
      }

      // Generar código de 6 dígitos
      // const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // // Eliminar códigos anteriores del mismo email
      // await this.verificationCodeModel.deleteMany({ 
      //   email: email.toLowerCase(),
      //   type: 'registration'
      // });

      // // Crear nuevo código de verificación
      // const newCode = new this.verificationCodeModel({
      //   email: email.toLowerCase(),
      //   code: verificationCode,
      //   type: 'registration',
      //   expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
      // });

      // await newCode.save();

      // // TODO: Enviar email con el código
      // this.logger.log(`Verification code generated for ${email}: ${verificationCode}`);
      
      return {
        code: 0,
        message: 'Email no registrado.',
        toast: 0,
        redirect_url: '/verify-code',
        type: 'success',
        data: { 
          email: email,
          codeLength: 6,
          expiresIn: 10 // minutos
        }
      };

    } catch (error: any) {
      this.logger.error(`Error in checkEmail: ${error.message}`, error.stack);
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
   * NUEVO FLUJO: Paso 2 - Enviar codigo de Registro
   */

  async sendRegistrationCode(checkEmailDto: CheckEmailDto): Promise<CustomerAuthResponse> 
  {
    try {
      const { email } = checkEmailDto;
      this.logger.log(`Sending registration code to: ${email}`);

      // Generar codigos 4 digitos 
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      // Eliminar códigos anteriores del mismo email
      await this.verificationCodeModel.deleteMany({ 
        email: email.toLowerCase(),
        type: 'registration'
      });

      // Crear nuevo código de verificación
      const newCode = new this.verificationCodeModel({
        email: email.toLowerCase(),
        code: verificationCode,
        type: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
      });

      await newCode.save();

      // TODO: Enviar email con el código
      this.logger.log(`Verification code generated for ${email}: ${verificationCode}`);
      
      return {
        code: 0,
        message: 'Código de verificación enviado.',
        toast: 0,
        redirect_url: '/verify-code',
        type: 'success',
        data: { 
          email: email,
          codeLength: 6,
          expiresIn: 10 // minutos
        }
      };

    } catch (error: any) {
      this.logger.error(`Error in checkEmail: ${error.message}`, error.stack);
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
   * NUEVO FLUJO: Paso 3 - Verificar código de registro
   */
  async verifyRegistrationCode(verifyCodeDto: VerifyCodeDto): Promise<CustomerAuthResponse> {
    try {
      const { email, code } = verifyCodeDto;
      this.logger.log(`Verifying registration code for: ${email}`);

      // Buscar código válido
      const verificationRecord = await this.verificationCodeModel.findOne({
        email: email.toLowerCase(),
        code: code,
        type: 'registration',
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!verificationRecord) {
        // Incrementar intentos si existe el código
        await this.verificationCodeModel.updateOne(
          { email: email.toLowerCase(), type: 'registration' },
          { $inc: { attempts: 1 } }
        );

        return {
          code: 1,
          message: 'Código inválido o expirado',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      // Marcar código como usado
      verificationRecord.isUsed = true;
      await verificationRecord.save();

      return {
        code: 0,
        message: 'Código verificado correctamente',
        toast: 0,
        redirect_url: '/complete-registration',
        type: 'success',
        data: { 
          email: email,
          verified: true
        }
      };

    } catch (error: any) {
      this.logger.error(`Error in verifyRegistrationCode: ${error.message}`, error.stack);
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
   * NUEVO FLUJO: Paso 4 - Completar registro con contraseña
   */
  async completeRegistration(completeDto: CompleteRegistrationDto): Promise<CustomerAuthResponse> {
    try {
      const { email, password, firstName, lastName, phone } = completeDto;
      this.logger.log(`Completing registration for: ${email}`);

      // Mostrar comparación de fechas en consola
      const fechaLimite = new Date(Date.now() - 30 * 60 * 1000);
      console.log('🕒 Fecha límite (hace 30 min):', fechaLimite.toISOString());
      console.log('🕒 Fecha actual:', new Date().toISOString());

      // Consultar todos los registros de verificación para el email
      const allVerifications = await this.verificationCodeModel.find({
        email: email.toLowerCase(),
        type: 'registration'
      }).sort({ createdAt: -1 });
      console.log('📋 Todos los registros de verificación para el email:');
      allVerifications.forEach((reg, idx) => {
        console.log(`  [${idx}] code: ${reg.code}, isUsed: ${reg.isUsed}, createdAt: ${reg.createdAt}`);
      });

      const recentVerification = await this.verificationCodeModel.findOne({
        email: email.toLowerCase(),
        type: 'registration',
        isUsed: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
      });

      console.log('🔎 Registro de verificación encontrado:', recentVerification);
      if (recentVerification) {
        console.log('📅 Fecha de creación del registro:', recentVerification.createdAt);
      }

      if (!recentVerification) {
        return {
          code: 1,
          message: 'Verificación expirada. Por favor inicia el proceso nuevamente.',
          toast: 1,
          redirect_url: '/register',
          type: 'error',
          data: null
        };
      }

      // Verificar que el email no esté ya registrado
      const existingCustomer = await this.customerModel.findOne({ 
        email: email.toLowerCase() 
      });

      if (existingCustomer) {
        return {
          code: 1,
          message: 'El email ya está registrado',
          toast: 1,
          redirect_url: '/login',
          type: 'error',
          data: null
        };
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el cliente
      const newCustomer = new this.customerModel({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        emailVerified: true, // Ya verificado en el paso anterior
        preferredLanguage: 'es',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
        isActive: true,
        oauthProviders: []
      });

      await newCustomer.save();

      // Generar tokens
      const accessToken = this.generateJwtToken(newCustomer);
      const refreshToken = this.generateRefreshToken(newCustomer);

      // Limpiar códigos de verificación usados
      await this.verificationCodeModel.deleteMany({
        email: email.toLowerCase(),
        type: 'registration'
      });

      return {
        code: 0,
        message: 'Registro completado exitosamente',
        toast: 0,
        redirect_url: '/',
        type: 'success',
        data: {
          token: accessToken,
          refreshToken: refreshToken,
          customer: {
            id: newCustomer._id.toString(),
            email: newCustomer.email,
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            emailVerified: newCustomer.emailVerified,
            preferredLanguage: newCustomer.preferredLanguage
          }
        }
      };

    } catch (error: any) {
      this.logger.error(`Error in completeRegistration: ${error.message}`, error.stack);
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
   * Registrar nuevo cliente (FLUJO ORIGINAL - mantener para compatibilidad)
   */
  async register(registerDto: RegisterCustomerDto): Promise<CustomerAuthResponse> {
    try {
      this.logger.log(`Registering new customer: ${registerDto.email}`);

      // Verificar si el email ya existe
      const existingCustomer = await this.customerModel.findOne({ 
        email: registerDto.email.toLowerCase() 
      });

      if (existingCustomer) {
        return {
          code: 1,
          message: 'El email ya está registrado',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

      // Generar token de verificación de email
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Crear nuevo cliente
      const newCustomer = new this.customerModel({
        email: registerDto.email.toLowerCase(),
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        preferredLanguage: registerDto.preferredLanguage || 'es',
        emailVerificationToken,
        emailVerified: false,
        oAuthProviders: [{
          provider: 'local',
          providerId: registerDto.email.toLowerCase(),
          email: registerDto.email.toLowerCase(),
          displayName: `${registerDto.firstName} ${registerDto.lastName}`
        }]
      });

      const savedCustomer = await newCustomer.save();

      // Generar JWT token
      const token = this.generateJwtToken(savedCustomer);
      const refreshToken = this.generateRefreshToken(savedCustomer);

      // TODO: Enviar email de verificación
      this.logger.log(`Customer registered successfully: ${savedCustomer.email}`);

      return {
        code: 0,
        message: 'Registro exitoso. Verifica tu email para completar el proceso.',
        toast: 0,
        redirect_url: '/',
        type: 'success',
        data: {
          token,
          refreshToken,
          customer: {
            id: savedCustomer._id.toString(),
            email: savedCustomer.email,
            firstName: savedCustomer.firstName,
            lastName: savedCustomer.lastName,
            avatar: savedCustomer.avatar,
            emailVerified: savedCustomer.emailVerified,
            preferredLanguage: savedCustomer.preferredLanguage
          }
        }
      };

    } catch (error) {
      this.logger.error('Error registering customer:', error);
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
   * Login de cliente
   */
  async login(loginDto: LoginCustomerDto, clientIP?: string): Promise<CustomerAuthResponse> {
    try {
      this.logger.log(`Customer login attempt: ${loginDto.email}`);

      // Buscar cliente por email
      const customer = await this.customerModel.findOne({ 
        email: loginDto.email.toLowerCase(),
        isActive: true
      });

      if (!customer || !customer.password) {
        return {
          code: 1,
          message: 'Credenciales inválidas',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(loginDto.password, customer.password);
      if (!isPasswordValid) {
        return {
          code: 1,
          message: 'Credenciales inválidas',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      // Actualizar último login
      customer.lastLoginAt = new Date();
      if (clientIP) {
        customer.lastLoginIP = clientIP;
      }
      await customer.save();

      // Generar tokens
      const token = this.generateJwtToken(customer);
      const refreshToken = this.generateRefreshToken(customer);

      this.logger.log(`Customer logged in successfully: ${customer.email}`);

      return {
        code: 0,
        message: 'Login exitoso',
        toast: 0,
        redirect_url: '/',
        type: 'success',
        data: {
          token,
          refreshToken,
          customer: {
            id: customer._id.toString(),
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            avatar: customer.avatar,
            emailVerified: customer.emailVerified,
            preferredLanguage: customer.preferredLanguage
          }
        }
      };

    } catch (error) {
      this.logger.error('Error logging in customer:', error);
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
   * Verificar email
   */
  async verifyEmail(verifyDto: VerifyEmailDto): Promise<CustomerAuthResponse> {
    try {
      const customer = await this.customerModel.findOne({ 
        emailVerificationToken: verifyDto.token 
      });

      if (!customer) {
        return {
          code: 1,
          message: 'Token de verificación inválido o expirado',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      customer.emailVerified = true;
      customer.emailVerificationToken = undefined;
      await customer.save();

      return {
        code: 0,
        message: 'Email verificado exitosamente',
        toast: 0,
        redirect_url: '/',
        type: 'success',
        data: null
      };

    } catch (error) {
      this.logger.error('Error verifying email:', error);
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
   * Solicitar reset de contraseña
   */
  async forgotPassword(forgotDto: ForgotPasswordDto): Promise<CustomerAuthResponse> {
    try {
      const customer = await this.customerModel.findOne({ 
        email: forgotDto.email.toLowerCase(),
        isActive: true
      });

      if (!customer) {
        // Por seguridad, siempre responder éxito aunque el email no exista
        return {
          code: 0,
          message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
          toast: 0,
          redirect_url: '',
          type: 'success',
          data: null
        };
      }

      // Generar token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      customer.passwordResetToken = resetToken;
      customer.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora
      await customer.save();

      // TODO: Enviar email con instrucciones de reset
      this.logger.log(`Password reset requested for: ${customer.email}`);

      return {
        code: 0,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: null
      };

    } catch (error) {
      this.logger.error('Error requesting password reset:', error);
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
   * Restablecer contraseña
   */
  async resetPassword(resetDto: ResetPasswordDto): Promise<CustomerAuthResponse> {
    try {
      const customer = await this.customerModel.findOne({
        passwordResetToken: resetDto.token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!customer) {
        return {
          code: 1,
          message: 'Token de reset inválido o expirado',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      // Hash nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(resetDto.newPassword, saltRounds);

      customer.password = hashedPassword;
      customer.passwordResetToken = undefined;
      customer.passwordResetExpires = undefined;
      await customer.save();

      this.logger.log(`Password reset successfully for: ${customer.email}`);

      return {
        code: 0,
        message: 'Contraseña restablecida exitosamente',
        toast: 0,
        redirect_url: '/login',
        type: 'success',
        data: null
      };

    } catch (error) {
      this.logger.error('Error resetting password:', error);
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
   * Obtener perfil del cliente
   */
  async getProfile(customerId: string): Promise<CustomerAuthResponse> {
    try {
      const customer = await this.customerModel.findById(customerId).select('-password -passwordResetToken -emailVerificationToken');

      if (!customer) {
        return {
          code: 1,
          message: 'Cliente no encontrado',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        };
      }

      return {
        code: 0,
        message: 'Perfil obtenido exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          customer: {
            id: customer._id.toString(),
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            avatar: customer.avatar,
            emailVerified: customer.emailVerified,
            preferredLanguage: customer.preferredLanguage
          }
        }
      };

    } catch (error) {
      this.logger.error('Error getting customer profile:', error);
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
   * Generar JWT token
   */
  private generateJwtToken(customer: CustomerDocument): string {
    const payload = { 
      sub: customer._id, 
      email: customer.email,
      type: 'customer'
    };
    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  /**
   * Generar refresh token
   */
  private generateRefreshToken(customer: CustomerDocument): string {
    const payload = { 
      sub: customer._id, 
      email: customer.email,
      type: 'customer_refresh'
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  /**
   * Validar JWT token
   */
  async validateToken(token: string): Promise<CustomerDocument | null> {
    try {
      const decoded = this.jwtService.verify(token);
      const customer = await this.customerModel.findById(decoded.sub);
      return customer?.isActive ? customer : null;
    } catch (error) {
      return null;
    }
  }

  // TODO: Métodos para OAuth (Google/Facebook) - preparados para futuro
  
  /**
   * Google OAuth Login (preparado para futuro)
   */
  async googleOAuth(googleToken: string): Promise<CustomerAuthResponse> {
    // TODO: Implementar integración con Google OAuth
    return {
      code: 1,
      message: 'Google OAuth no implementado aún',
      toast: 1,
      redirect_url: '',
      type: 'error',
      data: null
    };
  }

  /**
   * Facebook OAuth Login (preparado para futuro)
   */
  async facebookOAuth(facebookToken: string): Promise<CustomerAuthResponse> {
    // TODO: Implementar integración con Facebook OAuth
    return {
      code: 1,
      message: 'Facebook OAuth no implementado aún',
      toast: 1,
      redirect_url: '',
      type: 'error',
      data: null
    };
  }

  /**
   * Obtener historial de pedidos del cliente
   */
  async getOrderHistory(customerId: string, historyDto: OrderHistoryDto): Promise<CustomerAuthResponse> {
    try {
      const { order_status, out_trade_no, start_time, end_time, type_ids, page = 1, limit = 10, language = 'es' } = historyDto;

      // Usar el servicio real de órdenes
      const filters = {
        order_status,
        out_trade_no,
        start_time,
        end_time,
        type_ids
      };

      const [orderHistory, orderStats, serviceTypes] = await Promise.all([
        this.ordersService.getOrderHistory(customerId, filters, page, limit),
        this.ordersService.getOrderStatistics(customerId),
        this.ordersService.getUserServiceTypes(customerId)
      ]);

      // Transformar los datos al formato esperado por el frontend
      const transformedOrders = orderHistory.orders.map(order => ({
        id: order._id,
        type: 1, // Default
        out_trade_no: order.out_trade_no,
        type_id: order.type_id,
        type_plan_id: order.type_plan_id,
        product_id: 0, // Calculado después
        service_id: order.service_id || 0,
        substitute_recharge_id: 0,
        user_id: parseInt(customerId),
        number: order.number,
        screen: order.screen,
        payment_id: order.payment_id,
        service_start_time: order.service_start_time || '',
        service_end_time: order.service_end_time || '',
        currency: order.currency,
        otype: 1, // Default
        renew: 0,
        renew_type: 0,
        total_price: order.total_price,
        original_price: order.original_price,
        payment_fee: "0.00",
        payment_rate: "0%",
        ostatus: order.ostatus,
        refund_status: 0,
        coupon_discount: "0.00",
        promo_code_discount: "0.00",
        auto_renewal_discount: "0.00",
        create_time: order.create_time || new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        country_code: order.country_code || "PE",
        username: "",
        currency_icon1: order.currency === 'PEN' ? 'S/' : '$',
        currency_icon2: order.currency === 'PEN' ? 'PEN(S/)' : 'USD($)',
        type_name: (order.service as any)?.name || 'Servicio',
        type_image: (order.service as any)?.icon || 'https://static.gamsgocdn.com/image/default.webp',
        month_content: "1 mes", // Default
        is_solo: false,
        sub_account_info: (order as any).sub_account_info || 0,
        promo_code: order.promo_code || "",
        show_status: order.ostatus,
        actual_refund_status: 0,
        diff_price: "0.00",
        from_spu: "",
        substitute_recharge_status: -1
      }));

      const responseData = {
        total: orderHistory.total,
        list: transformedOrders,
        type: serviceTypes.map(st => ({
          type_id: st.type_id,
          type_name: st.type_name
        })),
        statistic: orderStats
      };

      this.logger.log(`Order history retrieved for customer ${customerId}: ${orderHistory.total} orders`);

      return {
        code: 0,
        message: 'Listo',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: responseData as any
      };

    } catch (error: any) {
      this.logger.error('Error getting order history:', error);
      
      // Fallback a datos mock en caso de error
      const mockData = {
        total: 0,
        list: [],
        type: [],
        statistic: [
          { order_status: 1, count: 0 },
          { order_status: 2, count: 0 },
          { order_status: 3, count: 0 },
          { order_status: 4, count: 0 },
          { order_status: 5, count: 0 }
        ]
      };

      return {
        code: 0, // Mantener éxito para no romper frontend
        message: 'Historial vacío',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: mockData as any
      };
    }
  }
}
