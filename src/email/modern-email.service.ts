import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface VerificationEmailData {
  userName: string;
  verificationCode: string;
  verificationUrl: string;
  expiresIn: string;
}

export interface WelcomeEmailData {
  userName: string;
  serviceName?: string;
  planName?: string;
  accountCredentials?: {
    email: string;
    password: string;
  };
}

export interface AccountCredentialsData {
  userName: string;
  serviceName: string;
  planName: string;
  orderNumber: string;
  profileName: string;
  expiresAt: string;
  credentials: {
    email: string;
    password: string;
  };
}

@Injectable()
export class ModernEmailService {
  private readonly logger = new Logger(ModernEmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Enviar email de verificación usando templates Handlebars
   */
  async sendVerificationEmail(email: string, data: VerificationEmailData): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verificación de correo electrónico - GamsGo',
        template: 'verification', // nombre del archivo .hbs
        context: data, // datos para el template
      });

      this.logger.log(`✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(email: string, data: WelcomeEmailData): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '¡Bienvenido a GamsGo!',
        template: 'welcome',
        context: data,
      });

      this.logger.log(`✅ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Enviar credenciales de cuenta
   */
  async sendAccountCredentials(email: string, data: AccountCredentialsData): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Sus credenciales de ${data.serviceName} están listas - GamsGo`,
        template: 'credentials',
        context: data,
      });

      this.logger.log(`✅ Credentials email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send credentials email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Enviar código de verificación simple (compatible con el EmailService existente)
   */
  async sendVerificationCode(email: string, code: string, language: string = 'es'): Promise<boolean> {
    try {
      const emailData: VerificationEmailData = {
        userName: email.split('@')[0], // Usar parte del email como nombre
        verificationCode: code,
        verificationUrl: `${process.env.FRONTEND_URL}/verify?code=${code}&email=${encodeURIComponent(email)}`,
        expiresIn: '10 minutos'
      };

      return await this.sendVerificationEmail(email, emailData);
    } catch (error) {
      this.logger.error(`❌ Failed to send verification code to ${email}:`, error);
      return false;
    }
  }

  /**
   * Generar código de verificación de 4 dígitos
   */
  generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Verificar si el email está en blacklist
   */
  isEmailBlacklisted(email: string): boolean {
    const blacklistedDomains = [
      'tempmail.com',
      '10minutemail.com',
      'guerrillamail.com',
      'throwaway.email'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return blacklistedDomains.includes(domain);
  }
}
