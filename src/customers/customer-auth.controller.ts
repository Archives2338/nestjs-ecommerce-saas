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
  ValidationPipe
} from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { 
  RegisterCustomerDto, 
  LoginCustomerDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  VerifyEmailDto,
  UpdateCustomerProfileDto,
  ChangePasswordDto,
  GoogleOAuthDto,
  FacebookOAuthDto,
  CheckEmailDto,
  VerifyCodeDto,
  CompleteRegistrationDto
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
  // @UseGuards(CustomerAuthGuard) // TODO: Implementar guard
  async updateProfile(@Body(ValidationPipe) updateDto: UpdateCustomerProfileDto, @Req() req: any) {
    // TODO: Implementar actualización de perfil
    const customerId = req.user?.id;
    
    this.logger.log(`Profile update request for customer: ${customerId}`);
    
    return {
      code: 1,
      message: 'Actualización de perfil no implementada aún',
      toast: 1,
      redirect_url: '',
      type: 'error',
      data: null
    };
  }

  /**
   * Cambiar contraseña
   * POST /api/customer/auth/change-password
   */
  @Post('change-password')
  // @UseGuards(CustomerAuthGuard) // TODO: Implementar guard
  async changePassword(@Body(ValidationPipe) changeDto: ChangePasswordDto, @Req() req: any) {
    // TODO: Implementar cambio de contraseña
    const customerId = req.user?.id;
    
    this.logger.log(`Password change request for customer: ${customerId}`);
    
    return {
      code: 1,
      message: 'Cambio de contraseña no implementado aún',
      toast: 1,
      redirect_url: '',
      type: 'error',
      data: null
    };
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
}
