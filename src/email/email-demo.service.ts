// 📧 EJEMPLO DE USO: GamsGoEmailService con templates de GamsGo
// ================================================================

import { Injectable, Logger } from '@nestjs/common';
import { GamsGoEmailService, VerificationEmailData, WelcomeEmailData, AccountCredentialsData } from './email.service.example';

@Injectable()
export class EmailDemoService {
  private readonly logger = new Logger(EmailDemoService.name);

  constructor(private readonly emailService: GamsGoEmailService) {}

  /**
   * Ejemplo 1: Enviar email de verificación de registro
   */
  async sendUserVerification(email: string, userName: string): Promise<boolean> {
    try {
      // Generar código de 6 dígitos
      const verificationCode = this.emailService.generateVerificationCode();
      
      // Datos para el template
      const emailData: VerificationEmailData = {
        userName: userName,
        verificationCode: verificationCode,
        verificationUrl: `${process.env.FRONTEND_URL}/verify?code=${verificationCode}&email=${email}`,
        expiresIn: '10 minutos'
      };

      // Enviar email
      const success = await this.emailService.sendVerificationEmail(email, emailData);
      
      if (success) {
        this.logger.log(`✅ Email de verificación enviado a ${email}`);
        // TODO: Guardar el código en base de datos con expiración
        return true;
      } else {
        this.logger.error(`❌ Error enviando email de verificación a ${email}`);
        return false;
      }

    } catch (error) {
      this.logger.error('Error in sendUserVerification:', error);
      return false;
    }
  }

  /**
   * Ejemplo 2: Enviar email de bienvenida post-verificación
   */
  async sendWelcomeAfterVerification(email: string, userName: string): Promise<boolean> {
    try {
      const welcomeData: WelcomeEmailData = {
        userName: userName,
        serviceName: 'GamsGo Premium',
        planName: 'Cuenta Verificada'
      };

      const success = await this.emailService.sendWelcomeEmail(email, welcomeData);
      
      if (success) {
        this.logger.log(`✅ Email de bienvenida enviado a ${email}`);
        return true;
      } else {
        this.logger.error(`❌ Error enviando email de bienvenida a ${email}`);
        return false;
      }

    } catch (error) {
      this.logger.error('Error in sendWelcomeAfterVerification:', error);
      return false;
    }
  }

  /**
   * Ejemplo 3: Enviar credenciales cuando se asigna cuenta
   */
  async sendCredentialsAfterPayment(email: string, orderData: any): Promise<boolean> {
    try {
      // Formatear datos para el template
      const formattedOrderData = {
        userName: email.split('@')[0], // Usar parte del email como nombre
        orderNumber: orderData.out_trade_no,
        serviceName: orderData.service_name,
        planName: orderData.plan_name,
        credentials: {
          email: orderData.access_info?.access_credentials?.email,
          password: orderData.access_info?.access_credentials?.password
        },
        profileName: orderData.access_info?.profile_name || 'Usuario Principal',
        expiresAt: orderData.expires_at
      };

      const success = await this.emailService.sendAccountCredentials(email, formattedOrderData);
      
      if (success) {
        this.logger.log(`✅ Email de credenciales enviado a ${email} para orden ${orderData.out_trade_no}`);
        return true;
      } else {
        this.logger.error(`❌ Error enviando credenciales a ${email}`);
        return false;
      }

    } catch (error) {
      this.logger.error('Error in sendCredentialsAfterPayment:', error);
      return false;
    }
  }

  /**
   * Ejemplo 4: Validar email antes de envío
   */
  async sendEmailWithValidation(email: string, emailType: 'verification' | 'welcome' | 'credentials', data: any): Promise<{ success: boolean; message: string }> {
    try {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Formato de email inválido' };
      }

      // Verificar blacklist
      if (this.emailService.isEmailBlacklisted(email)) {
        return { success: false, message: 'Email en blacklist' };
      }

      // Enviar según tipo
      let success = false;
      switch (emailType) {
        case 'verification':
          success = await this.sendUserVerification(email, data.userName);
          break;
        case 'welcome':
          success = await this.sendWelcomeAfterVerification(email, data.userName);
          break;
        case 'credentials':
          success = await this.sendCredentialsAfterPayment(email, data);
          break;
      }

      return {
        success,
        message: success ? 'Email enviado exitosamente' : 'Error enviando email'
      };

    } catch (error) {
      this.logger.error('Error in sendEmailWithValidation:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }
}

// 🔧 CONFIGURACIÓN REQUERIDA EN .env
// ===================================
/*
# Email Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@gamsgo.com
APP_NAME=GamsGo
FRONTEND_URL=https://gamsgo.com
*/

// 📦 DEPENDENCIAS REQUERIDAS
// ===========================
/*
npm install nodemailer @types/nodemailer
npm install @sendgrid/mail (opcional, para SendGrid directo)
*/

// 🚀 INTEGRACIÓN EN EL MÓDULO
// ============================
/*
import { Module } from '@nestjs/common';
import { GamsGoEmailService } from './email.service.example';
import { EmailDemoService } from './email-demo.service';

@Module({
  providers: [GamsGoEmailService, EmailDemoService],
  exports: [GamsGoEmailService, EmailDemoService]
})
export class EmailModule {}
*/

// Exportación al final del archivo removida para evitar conflicto
