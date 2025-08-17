import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ModernEmailService } from '../email/modern-email.service';
import { GamsGoEmailService } from '../email/email.service.example';
import * as crypto from 'crypto';

interface TestVerificationDto {
  email: string;
  userName?: string;
  verificationCode?: string;
}

interface TestWelcomeDto {
  email: string;
  userName: string;
  serviceName?: string;
  planName?: string;
}

interface TestCredentialsDto {
  email: string;
  userName: string;
  serviceName: string;
  planName: string;
  orderNumber: string;
  profileName: string;
  credentials: {
    email: string;
    password: string;
  };
}

interface TestPasswordRecoveryDto {
  email: string;
  userName?: string;
  recoveryCode?: string;
}

@Controller('test/email')
export class TestEmailController {
  private readonly logger = new Logger(TestEmailController.name);

  constructor(
    private readonly modernEmailService: ModernEmailService,
    private readonly gamsGoEmailService: GamsGoEmailService
  ) {}

  @Post('verification')
  async testVerificationEmail(@Body() dto: TestVerificationDto) {
    try {
      this.logger.log('🧪 Testing verification email with ModernEmailService...');
      
      const result = await this.modernEmailService.sendVerificationEmail(dto.email, {
        userName: dto.userName || 'Usuario Prueba',
        verificationCode: dto.verificationCode || this.modernEmailService.generateVerificationCode(),
        verificationUrl: `${process.env.FRONTEND_URL}/verify?code=${dto.verificationCode}&email=${encodeURIComponent(dto.email)}`,
        expiresIn: '10 minutos'
      });

      if (result) {
        return { 
          success: true, 
          message: '✅ Verification email sent successfully with @nestjs-modules/mailer',
          email: dto.email 
        };
      } else {
        return { 
          success: false, 
          message: '❌ Failed to send verification email',
          email: dto.email 
        };
      }
    } catch (error) {
      this.logger.error('Test verification email failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: dto.email 
      };
    }
  }

  @Post('welcome')
  async testWelcomeEmail(@Body() dto: TestWelcomeDto) {
    try {
      this.logger.log('🧪 Testing welcome email with ModernEmailService...');
      
      const result = await this.modernEmailService.sendWelcomeEmail(dto.email, {
        userName: dto.userName,
        serviceName: dto.serviceName || 'Disney Plus',
        planName: dto.planName || 'Plan Familiar'
      });

      if (result) {
        return { 
          success: true, 
          message: '✅ Welcome email sent successfully with @nestjs-modules/mailer',
          email: dto.email 
        };
      } else {
        return { 
          success: false, 
          message: '❌ Failed to send welcome email',
          email: dto.email 
        };
      }
    } catch (error) {
      this.logger.error('Test welcome email failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: dto.email 
      };
    }
  }

  @Post('credentials')
  async testCredentialsEmail(@Body() dto: TestCredentialsDto) {
    try {
      this.logger.log('🧪 Testing credentials email with ModernEmailService...');
      
      const result = await this.modernEmailService.sendAccountCredentials(dto.email, {
        userName: dto.userName,
        serviceName: dto.serviceName,
        planName: dto.planName,
        orderNumber: dto.orderNumber,
        profileName: dto.profileName,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        credentials: dto.credentials
      });

      if (result) {
        return { 
          success: true, 
          message: '✅ Credentials email sent successfully with @nestjs-modules/mailer',
          email: dto.email 
        };
      } else {
        return { 
          success: false, 
          message: '❌ Failed to send credentials email',
          email: dto.email 
        };
      }
    } catch (error) {
      this.logger.error('Test credentials email failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: dto.email 
      };
    }
  }

  @Post('simple-test')
  async simpleTest(@Body() { email }: { email: string }) {
    try {
      this.logger.log('🧪 Simple email test with @nestjs-modules/mailer...');
      
      const code = this.modernEmailService.generateVerificationCode();
      const result = await this.modernEmailService.sendVerificationCode(email, code);

      return { 
        success: result, 
        message: result ? '✅ Simple test email sent' : '❌ Simple test failed',
        email,
        code 
      };
    } catch (error) {
      this.logger.error('Simple email test failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email 
      };
    }
  }

  @Post('password-recovery')
  async testPasswordRecovery(@Body() dto: TestPasswordRecoveryDto) {
    try {
      this.logger.log('🧪 Testing password recovery email with GamsGoEmailService + MailerService...');
      
      const code = dto.recoveryCode || this.modernEmailService.generateVerificationCode();
      const result = await this.gamsGoEmailService.sendPasswordRecoveryCode(
        dto.email, 
        code, 
        dto.userName
      );

      if (result) {
        return { 
          success: true, 
          message: '✅ Password recovery email sent successfully with MailerService',
          email: dto.email,
          code: code
        };
      } else {
        return { 
          success: false, 
          message: '❌ Failed to send password recovery email',
          email: dto.email 
        };
      }
    } catch (error) {
      this.logger.error('Test password recovery failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: dto.email 
      };
    }
  }

  @Post('test-forgot-password-flow')
  async testForgotPasswordFlow(@Body() { email }: { email: string }) {
    try {
      this.logger.log('🧪 Testing complete forgot password flow...');
      
      // Simular el flujo completo como lo haría el frontend
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      const result = await this.gamsGoEmailService.sendPasswordRecoveryCode(
        email,
        resetToken,
        email.split('@')[0]
      );

      if (result) {
        return { 
          success: true, 
          message: '✅ Complete forgot password flow test successful',
          email: email,
          resetToken: resetToken,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
          instructions: [
            '1. Email enviado con el token de reset',
            '2. Usuario debe usar el enlace en el email',
            '3. Frontend debe hacer POST a /api/customer/auth/reset-password con { token, newPassword }'
          ]
        };
      } else {
        return { 
          success: false, 
          message: '❌ Failed to send password recovery email',
          email: email 
        };
      }
    } catch (error) {
      this.logger.error('Test forgot password flow failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: email 
      };
    }
  }

  @Post('verification-mailer')
  async testVerificationWithMailer(@Body() dto: TestVerificationDto) {
    try {
      this.logger.log('🧪 Testing verification email with GamsGoEmailService + MailerService...');
      
      const code = dto.verificationCode || this.modernEmailService.generateVerificationCode();
      const verificationData = {
        userName: dto.userName || 'Usuario Prueba',
        verificationCode: code,
        verificationUrl: `${process.env.FRONTEND_URL}/verify?code=${code}&email=${encodeURIComponent(dto.email)}`,
        expiresIn: '10 minutos'
      };
      
      const result = await this.gamsGoEmailService.sendVerificationCodeWithMailer(
        dto.email, 
        verificationData
      );

      if (result) {
        return { 
          success: true, 
          message: '✅ Verification email sent successfully with MailerService',
          email: dto.email,
          code: code
        };
      } else {
        return { 
          success: false, 
          message: '❌ Failed to send verification email',
          email: dto.email 
        };
      }
    } catch (error) {
      this.logger.error('Test verification with mailer failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: dto.email 
      };
    }
  }

  /**
   * 🔐 Test Password Change Notification Email
   */
  @Post('test-password-change')
  async testPasswordChangeEmail(@Body() dto: { email: string, userName?: string }) {
    try {
      this.logger.log(`🧪 Testing password change notification email to: ${dto.email}`);

      const testData = {
        userName: dto.userName || 'Usuario de Prueba',
        changeTime: new Date().toLocaleString('es-ES', {
          timeZone: 'America/Lima',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        loginUrl: 'https://meteleplay.com/login'
      };

      // Test usando el servicio de email con template
      const emailSent = await this.gamsGoEmailService.sendPasswordChangeNotification(
        dto.email,
        testData
      );

      if (emailSent) {
        this.logger.log(`✅ Test password change email sent successfully to: ${dto.email}`);
        return {
          success: true,
          message: `✅ Email de cambio de contraseña enviado exitosamente a ${dto.email}`,
          email: dto.email,
          data: testData
        };
      } else {
        this.logger.warn(`⚠️ Failed to send test password change email to: ${dto.email}`);
        return {
          success: false,
          message: `⚠️ Failed to send password change email to ${dto.email}`,
          email: dto.email
        };
      }

    } catch (error) {
      this.logger.error('Test password change email failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: dto.email 
      };
    }
  }

  /**
   * 🔗 Test Complete Change Password Flow
   */
  @Post('test-change-password-flow')
  async testChangePasswordFlow(@Body() dto: { email: string, userName?: string }) {
    try {
      this.logger.log(`🧪 Testing complete change password flow for: ${dto.email}`);

      const userName = dto.userName || 'Usuario de Prueba';
      const results = [];

      // 1. Test notification email
      const notificationData = {
        userName: userName,
        changeTime: new Date().toLocaleString('es-ES', {
          timeZone: 'America/Lima',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        loginUrl: 'https://meteleplay.com/login'
      };

      const notificationSent = await this.gamsGoEmailService.sendPasswordChangeNotification(
        dto.email,
        notificationData
      );

      results.push({
        step: '🔐 Password Change Notification',
        success: notificationSent,
        message: notificationSent ? 
          '✅ Notification email sent successfully' : 
          '❌ Failed to send notification email'
      });

      // 2. Test welcome email (as confirmation)
      const welcomeData = {
        userName: userName,
        serviceName: 'MetelePlay',
        planName: 'Cuenta Actualizada'
      };

      const welcomeSent = await this.gamsGoEmailService.sendWelcomeEmail(
        dto.email,
        welcomeData
      );

      results.push({
        step: '🎉 Welcome/Confirmation Email',
        success: welcomeSent,
        message: welcomeSent ? 
          '✅ Welcome email sent successfully' : 
          '❌ Failed to send welcome email'
      });

      const overallSuccess = results.every(result => result.success);

      this.logger.log(`${overallSuccess ? '✅' : '❌'} Change password flow test completed for: ${dto.email}`);

      return {
        success: overallSuccess,
        message: `${overallSuccess ? '✅' : '❌'} Complete change password flow test ${overallSuccess ? 'successful' : 'failed'}`,
        email: dto.email,
        userName: userName,
        results: results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };

    } catch (error) {
      this.logger.error('Test change password flow failed:', error);
      return { 
        success: false, 
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        email: dto.email 
      };
    }
  }
}
