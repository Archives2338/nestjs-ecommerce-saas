// 📧 SISTEMA DE EMAIL CON HANDLEBARS TEMPLATES - GamsGo
// =====================================================

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { MailerService } from '@nestjs-modules/mailer';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface VerificationEmailData {
  userName: string;
  verificationCode: string;
  verificationUrl: string;
  expiresIn: string;
}

interface WelcomeEmailData {
  userName: string;
  serviceName?: string;
  planName?: string;
  accountCredentials?: {
    email: string;
    password: string;
  };
}

interface AccountCredentialsData {
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
export class GamsGoEmailService {
  private readonly logger = new Logger(GamsGoEmailService.name);
  private transporter: nodemailer.Transporter | null;
  private templatesPath: string;

  constructor(private readonly mailerService: MailerService) {
    this.templatesPath = path.join(process.cwd(), 'src', 'email', 'templates');
    this.setupHandlebarsHelpers();
  }


  private setupHandlebarsHelpers() {
    // Helper para formatear fechas
    handlebars.registerHelper('formatDate', (date: string | Date) => {
      return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // Helper para obtener el año actual
    handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });

    // Helper para formatear URLs
    handlebars.registerHelper('frontendUrl', (path?: string) => {
      const baseUrl = process.env.FRONTEND_URL || 'https://gamsgo.com';
      return path ? `${baseUrl}${path}` : baseUrl;
    });
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      
      if (!fs.existsSync(templatePath)) {
        this.logger.warn(`Template not found: ${templatePath}, using fallback`);
        return this.getFallbackTemplate(templateName, data);
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      this.logger.error(`Error rendering template ${templateName}:`, error);
      return this.getFallbackTemplate(templateName, data);
    }
  }

  private getFallbackTemplate(templateName: string, data: any): string {
    // Templates de fallback en caso de que no existan los archivos .hbs
    switch (templateName) {
      case 'verification':
        return `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>Verificación</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <img src="https://mybucketimperio.s3.us-east-2.amazonaws.com/comprobantes/1cd8af67-f3b4-4839-82df-66f70a992519.png" width="150" alt="GamsGo" />
            <h1>¡Hola ${data.userName}!</h1>
            <p>Tu código de verificación es:</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
              ${data.verificationCode}
            </div>
            <p>Válido por ${data.expiresIn}</p>
            <a href="${data.verificationUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar cuenta</a>
          </body>
          </html>
        `;
      case 'welcome':
        return `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>Bienvenido</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <img src="https://mybucketimperio.s3.us-east-2.amazonaws.com/comprobantes/1cd8af67-f3b4-4839-82df-66f70a992519.png" width="150" alt="GamsGo" />
            <h1>¡Bienvenido ${data.userName}!</h1>
            <p>Tu cuenta ha sido activada exitosamente.</p>
            ${data.serviceName ? `<p><strong>Servicio:</strong> ${data.serviceName}</p>` : ''}
            ${data.planName ? `<p><strong>Plan:</strong> ${data.planName}</p>` : ''}
            <a href="${process.env.FRONTEND_URL || 'https://gamsgo.com'}/dashboard" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Ir a mi cuenta</a>
          </body>
          </html>
        `;
      case 'credentials':
        return `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>Credenciales</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <img src="https://mybucketimperio.s3.us-east-2.amazonaws.com/comprobantes/1cd8af67-f3b4-4839-82df-66f70a992519.png" width="150" alt="GamsGo" />
            <h1>🔑 Sus credenciales están listas!</h1>
            <p><strong>Hola ${data.userName}</strong>,</p>
            <p>Orden #${data.orderNumber || 'N/A'} procesada exitosamente.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Detalles:</h3>
              <p><strong>Servicio:</strong> ${data.serviceName}</p>
              <p><strong>Plan:</strong> ${data.planName}</p>
              <p><strong>Email:</strong> <code style="background: #fff; padding: 4px; border-radius: 4px;">${data.credentials.email}</code></p>
              <p><strong>Password:</strong> <code style="background: #fff; padding: 4px; border-radius: 4px;">${data.credentials.password}</code></p>
              ${data.profileName ? `<p><strong>Perfil:</strong> ${data.profileName}</p>` : ''}
              ${data.expiresAt ? `<p><strong>Válido hasta:</strong> ${new Date(data.expiresAt).toLocaleDateString('es-PE')}</p>` : ''}
            </div>
            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h4 style="margin-top: 0;">⚠️ Importante:</h4>
              <ul>
                <li>No comparta estas credenciales</li>
                <li>No modifique la contraseña</li>
                <li>Use solo el perfil asignado</li>
              </ul>
            </div>
          </body>
          </html>
        `;
      default:
        return `<html><body><h1>Template no disponible</h1><p>Tipo: ${templateName}</p></body></html>`;
    }
  }

  /**
   * Enviar email de verificación de cuenta
   */
  async sendVerificationEmail(email: string, data: VerificationEmailData): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn(`📧 [DEV MODE] Email de verificación para ${email}:`);
        this.logger.warn(`👤 Usuario: ${data.userName}`);
        this.logger.warn(`🔢 Código: ${data.verificationCode}`);
        this.logger.warn(`🔗 URL: ${data.verificationUrl}`);
        this.logger.warn(`⏰ Expira en: ${data.expiresIn}`);
        
        // Mostrar maqueta del template
        const htmlContent = await this.renderTemplate('verification', data);
        this.logger.warn('� MAQUETA DEL EMAIL (VERIFICATION):');
        this.logger.warn('====================================');
        this.logger.warn(htmlContent.substring(0, 500) + '...[truncated]');
        this.logger.warn('====================================');
        
        return true;
      }

      const htmlContent = await this.renderTemplate('verification', data);
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'GamsGo'}" <${process.env.FROM_EMAIL || 'noreply@gamsgo.com'}>`,
        to: email,
        subject: 'Verificación de correo electrónico - GamsGo',
        html: htmlContent,
        text: `${data.userName}, tu código de verificación es: ${data.verificationCode}. Válido por ${data.expiresIn}.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Verification email sent to ${email}, messageId: ${result.messageId}`);
      
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
      if (!this.transporter) {
        this.logger.warn(`📧 [DEV MODE] Email de bienvenida para ${email}:`);
        this.logger.warn(`👤 Usuario: ${data.userName}`);
        this.logger.warn(`📱 Servicio: ${data.serviceName || 'N/A'}`);
        this.logger.warn(`📊 Plan: ${data.planName || 'N/A'}`);
        
        // Mostrar maqueta del template
        const htmlContent = await this.renderTemplate('welcome', data);
        this.logger.warn('📧 MAQUETA DEL EMAIL (WELCOME):');
        this.logger.warn('====================================');
        this.logger.warn(htmlContent.substring(0, 500) + '...[truncated]');
        this.logger.warn('====================================');
        
        return true;
      }

      const htmlContent = await this.renderTemplate('welcome', data);
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'GamsGo'}" <${process.env.FROM_EMAIL || 'noreply@gamsgo.com'}>`,
        to: email,
        subject: '¡Bienvenido a GamsGo!',
        html: htmlContent,
        text: `¡Hola ${data.userName}! Tu cuenta ha sido activada exitosamente.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Welcome email sent to ${email}, messageId: ${result.messageId}`);
      
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
      if (!this.transporter) {
        this.logger.warn(`📧 [DEV MODE] Credenciales para ${email}:`);
        this.logger.warn(`👤 Usuario: ${data.userName}`);
        this.logger.warn(`📱 Servicio: ${data.serviceName}`);
        this.logger.warn(`📊 Plan: ${data.planName}`);
        this.logger.warn(`🔐 Email credencial: ${data.credentials.email}`);
        this.logger.warn(`🔑 Password credencial: ${data.credentials.password}`);
        
        // Mostrar maqueta del template
        const htmlContent = await this.renderTemplate('credentials', data);
        this.logger.warn('� MAQUETA DEL EMAIL (CREDENTIALS):');
        this.logger.warn('====================================');
        this.logger.warn(htmlContent.substring(0, 500) + '...[truncated]');
        this.logger.warn('====================================');
        
        return true;
      }

      const htmlContent = await this.renderTemplate('credentials', data);
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'GamsGo'}" <${process.env.FROM_EMAIL || 'noreply@gamsgo.com'}>`,
        to: email,
        subject: `Sus credenciales de ${data.serviceName} están listas - GamsGo`,
        html: htmlContent,
        text: `Sus credenciales para ${data.serviceName} están listas. Orden #${data.orderNumber}. Email: ${data.credentials.email}, Password: ${data.credentials.password}.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Credentials email sent to ${email}, messageId: ${result.messageId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send credentials email to ${email}:`, error);
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

  /**
   * Enviar código de recuperación de contraseña usando MailerService
   * Este método usa @nestjs-modules/mailer directamente
   */
  async sendPasswordRecoveryCode(email: string, code: string, userName?: string): Promise<boolean> {
    try {
      this.logger.log(`📧 Sending password recovery email to ${email} using MailerService...`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperación de contraseña - MetelePlay',
        template: 'forget-password', // Nombre de la plantilla sin extensión .hbs
        context: {
          userName: userName || email.split('@')[0],
          recoveryCode: code,
          verificationUrl: `${process.env.FRONTEND_URL || 'https://gamsgo.com'}/reset-password?code=${code}&email=${encodeURIComponent(email)}`,
          expiresIn: '15 minutos',
          currentYear: new Date().getFullYear(),
          frontendUrl: process.env.FRONTEND_URL || 'https://gamsgo.com'
        }
      });

      this.logger.log(`✅ Password recovery email sent to ${email} using MailerService`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send password recovery email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Enviar código de verificación usando MailerService
   * Método equivalente a sendVerificationEmail pero usando @nestjs-modules/mailer
   */
  async sendVerificationCodeWithMailer(email: string, data: VerificationEmailData): Promise<boolean> {
    try {
      this.logger.log(`📧 Sending verification email to ${email} using MailerService...`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verificación de correo electrónico - MetelePlay',
        template: 'verification', // Usa el template verification.hbs existente
        context: {
          userName: data.userName,
          verificationCode: data.verificationCode,
          verificationUrl: data.verificationUrl,
          expiresIn: data.expiresIn,
          currentYear: new Date().getFullYear(),
          frontendUrl: process.env.FRONTEND_URL || 'https://gamsgo.com'
        }
      });

      this.logger.log(`✅ Verification email sent to ${email} using MailerService`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Método genérico para enviar cualquier template con MailerService
   */
  async sendEmailWithTemplate(
    email: string, 
    templateName: string, 
    subject: string, 
    context: any
  ): Promise<boolean> {
    try {
      this.logger.log(`📧 Sending ${templateName} email to ${email} using MailerService...`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: templateName,
        context: {
          ...context,
          currentYear: new Date().getFullYear(),
          frontendUrl: process.env.FRONTEND_URL || 'https://gamsgo.com'
        }
      });

      this.logger.log(`✅ ${templateName} email sent to ${email} using MailerService`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send ${templateName} email to ${email}:`, error);
      return false;
    }
  }

  /**
   * 🔐 Enviar notificación de cambio de contraseña
   */
  async sendPasswordChangeNotification(
    email: string, 
    data: {
      userName: string;
      changeTime: string;
      loginUrl: string;
    }
  ): Promise<boolean> {
    return this.sendEmailWithTemplate(
      email,
      'password-change',
      '🔐 Contraseña Actualizada - MetelePlay',
      data
    );
  }
}

// Interfaces para tipo de datos de email
interface PasswordChangeData {
  userName: string;
  changeTime: string;
  loginUrl: string;
}

// Exports
export { 
  VerificationEmailData, 
  WelcomeEmailData, 
  AccountCredentialsData,
  PasswordChangeData 
};
