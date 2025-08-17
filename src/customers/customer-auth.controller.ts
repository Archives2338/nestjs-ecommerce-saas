import { 
  Controller, 
  Post, 
  Get,
  Put,
  Body, 
  Req,
  UseGuards,
  Logger,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerJwtAuthGuard } from '../auth/guards/customer-jwt-auth.guard';
import { CustomerAuthService } from './customer-auth.service';
import { 
  RegisterCustomerDto, 
  LoginCustomerDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  VerifyEmailDto,
  UpdateCustomerProfileDto,
  ChangePasswordDto,
  CustomerAuthResponse,
  GoogleOAuthDto,
  FacebookOAuthDto,
  CheckEmailDto,
  VerifyCodeDto,
  CompleteRegistrationDto,
  OrderHistoryDto
} from './dto/customer-auth.dto';

@Controller('api/customer/auth')
export class CustomerAuthController {
  private readonly logger = new Logger(CustomerAuthController.name);

  constructor(private readonly customerAuthService: CustomerAuthService) {}

  // ============================================
  // NUEVO FLUJO DE REGISTRO (3 PASOS)
  // ============================================

  /**
   * PASO 1: Verificar email 
   * POST /api/customer/auth/check-email
   */
  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body(ValidationPipe) checkEmailDto: CheckEmailDto) {
    this.logger.log(`Email check for: ${checkEmailDto.email}`);
    
    const result = await this.customerAuthService.checkEmail(checkEmailDto);
    
    this.logger.log(`Email check result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * PASO 2: Enviar código de verificación
   * POST /api/customer/auth/send-code
   */
  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  async sendCode(@Body(ValidationPipe) checkEmailDto: CheckEmailDto) {
    this.logger.log(`Sending verification code to: ${checkEmailDto.email}`);
    
    const result = await this.customerAuthService.sendRegistrationCode(checkEmailDto);
    
    this.logger.log(`Send code result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * PASO 3: Verificar código de registro
   * POST /api/customer/auth/verify-code
   */
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body(ValidationPipe) verifyCodeDto: VerifyCodeDto) {
    this.logger.log(`Code verification for: ${verifyCodeDto.email}`);
    
    const result = await this.customerAuthService.verifyRegistrationCode(verifyCodeDto);
    
    this.logger.log(`Code verification result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * PASO 4: Completar registro con contraseña
   * POST /api/customer/auth/complete-registration
   */
  @Post('complete-registration')
  @HttpCode(HttpStatus.OK)
  async completeRegistration(@Body(ValidationPipe) completeDto: CompleteRegistrationDto) {
    this.logger.log(`Registration completion for: ${completeDto.email}`);
    
    const result = await this.customerAuthService.completeRegistration(completeDto);
    
    this.logger.log(`Registration completion result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  // ============================================
  // FLUJO ORIGINAL (mantener para compatibilidad)
  // ============================================

  /**
   * Registro de nuevo cliente (FLUJO ORIGINAL)
   * POST /api/customer/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body(ValidationPipe) registerDto: RegisterCustomerDto, @Req() req: any) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    const clientIP = req.ip || req.connection.remoteAddress;
    
    const result = await this.customerAuthService.register(registerDto);
    
    this.logger.log(`Registration result for ${registerDto.email}: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * Login de cliente
   * POST /api/customer/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginCustomerDto, @Req() req: any) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    const clientIP = req.ip || req.connection.remoteAddress;
    
    const result = await this.customerAuthService.login(loginDto, clientIP);
    
    this.logger.log(`Login result for ${loginDto.email}: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * Verificar email
   * POST /api/customer/auth/verify-email
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body(ValidationPipe) verifyDto: VerifyEmailDto) {
    this.logger.log(`Email verification attempt with token: ${verifyDto.token.substring(0, 8)}...`);
    
    const result = await this.customerAuthService.verifyEmail(verifyDto);
    
    this.logger.log(`Email verification result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * Solicitar reset de contraseña
   * POST /api/customer/auth/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(ValidationPipe) forgotDto: ForgotPasswordDto) {
    this.logger.log(`Password reset request for email: ${forgotDto.email}`);
    
    const result = await this.customerAuthService.forgotPassword(forgotDto);
    
    this.logger.log(`Password reset request result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * Restablecer contraseña
   * POST /api/customer/auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) resetDto: ResetPasswordDto) {
    this.logger.log(`Password reset attempt with token: ${resetDto.token.substring(0, 8)}...`);
    
    const result = await this.customerAuthService.resetPassword(resetDto);
    
    this.logger.log(`Password reset result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * Obtener perfil del cliente autenticado
   * GET /api/customer/auth/profile
   */
  @Get('profile')
  // @UseGuards(CustomerAuthGuard) // TODO: Implementar guard
  async getProfile(@Req() req: any) {
    // TODO: Extraer customer ID del JWT token
    const customerId = req.user?.id; // Esto vendrá del JWT guard
    
    if (!customerId) {
      return {
        code: 1,
        message: 'No autorizado',
        toast: 1,
        redirect_url: '/login',
        type: 'error',
        data: null
      };
    }

    this.logger.log(`Profile request for customer: ${customerId}`);
    
    const result = await this.customerAuthService.getProfile(customerId);
    
    return result;
  }

  /**
   * Actualizar perfil del cliente
   * PUT /api/customer/auth/profile
   */
  @Put('profile')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Body(ValidationPipe) updateDto: UpdateCustomerProfileDto, @Req() req: any) {
    try {
      // const customerId = req.user?.id;
      const customerId = req.user?.userId || req.user?.sub || req.user?.id;
      
      this.logger.log(`Profile update request for customer: ${customerId}`);
      this.logger.log(`Update data: ${JSON.stringify(updateDto, null, 2)}`);
      
      const result = await this.customerAuthService.updateProfile(customerId, updateDto);
      
      this.logger.log(`Profile update result for customer ${customerId}: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
      return result;
      
    } catch (error: any) {
      this.logger.error(`Profile update error: ${error.message}`, error.stack);
      
      if (error.name === 'UnauthorizedError' || error.status === 401) {
        throw new UnauthorizedException({
          code: 1,
          message: 'No autorizado para actualizar perfil',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        });
      }
      
      if (error.name === 'ValidationError' || error.status === 400) {
        throw new BadRequestException({
          code: 1,
          message: error.message || 'Datos de perfil inválidos',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: null
        });
      }
      
      throw new HttpException({
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Cambiar contraseña
   * POST /api/customer/auth/change-password
   */
  @Post('change-password')
  @UseGuards(CustomerJwtAuthGuard)
  async changePassword(
    @Body(ValidationPipe) changeDto: ChangePasswordDto, 
    @Req() req: any
  ): Promise<CustomerAuthResponse> {
    try {
      const customerId = req.user?.userId || req.user?.sub || req.user?.id;
      
      if (!customerId) {
        this.logger.warn('Change password attempt without valid customer ID');
        throw new UnauthorizedException({
          code: 1,
          message: 'Token inválido o expirado',
          toast: 1,
          redirect_url: '/login',
          type: 'error',
          data: null
        });
      }

      this.logger.log(`Password change request for customer: ${customerId}`);
      
      const result = await this.customerAuthService.changePassword(customerId, changeDto);
      
      // Si hay error en el resultado, lanzar excepción HTTP apropiada
      if (result.code !== 0) {
        if (result.message.includes('Token inválido') || result.message.includes('No autorizado')) {
          throw new UnauthorizedException(result);
        } else if (result.message.includes('incorrecta') || result.message.includes('diferente')) {
          throw new BadRequestException(result);
        } else if (result.message.includes('no encontrado')) {
          throw new NotFoundException(result);
        } else {
          throw new BadRequestException(result);
        }
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('Error in changePassword endpoint:', error);
      
      // Si ya es una excepción HTTP, re-lanzarla
      if (error instanceof UnauthorizedException || 
          error instanceof BadRequestException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      // Para errores no manejados, devolver 500
      throw new BadRequestException({
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      });
    }
  }

  /**
   * Logout (invalidar token)
   * POST /api/customer/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    // TODO: Implementar invalidación de tokens (blacklist)
    this.logger.log(`Logout request`);
    
    return {
      code: 0,
      message: 'Logout exitoso',
      toast: 0,
      redirect_url: '/login',
      type: 'success',
      data: null
    };
  }

  // OAuth Endpoints (preparados para futuro)

  /**
   * Google OAuth Login
   * POST /api/customer/auth/google
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleOAuth(@Body(ValidationPipe) googleDto: GoogleOAuthDto) {
    this.logger.log(`Google OAuth login attempt`);
    
    const result = await this.customerAuthService.googleOAuth(googleDto.googleToken);
    
    this.logger.log(`Google OAuth result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * Facebook OAuth Login
   * POST /api/customer/auth/facebook
   */
  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  async facebookOAuth(@Body(ValidationPipe) facebookDto: FacebookOAuthDto) {
    this.logger.log(`Facebook OAuth login attempt`);
    
    const result = await this.customerAuthService.facebookOAuth(facebookDto.facebookToken);
    
    this.logger.log(`Facebook OAuth result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }

  /**
   * Refresh Token
   * POST /api/customer/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    // TODO: Implementar refresh token
    this.logger.log(`Token refresh attempt`);
    
    return {
      code: 1,
      message: 'Refresh token no implementado aún',
      toast: 1,
      redirect_url: '',
      type: 'error',
      data: null
    };
  }

  /**
   * Historial de pedidos del cliente
   * POST /api/customer/auth/order-history
   */
  @Post('order-history')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(CustomerAuthGuard) // TODO: Implementar guard cuando esté listo
  async getOrderHistory(@Body(ValidationPipe) historyDto: OrderHistoryDto, @Req() req: any) {
    // TODO: Extraer customer ID del JWT token
    const customerId = req.user?.id || req.headers['customer-id']; // Temporal mientras no hay JWT
    
    if (!customerId) {
      return {
        code: 1,
        message: 'No autorizado',
        toast: 1,
        redirect_url: '/login',
        type: 'error',
        data: null
      };
    }

    this.logger.log(`Order history request for customer: ${customerId}`);
    
    const result = await this.customerAuthService.getOrderHistory(customerId, historyDto);
    
    this.logger.log(`Order history result: ${result.code === 0 ? 'SUCCESS' : 'FAILED'}`);
    return result;
  }
}
