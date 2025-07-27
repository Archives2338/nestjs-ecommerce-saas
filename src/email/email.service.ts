import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar el transportador de email
    // Por ahora usaremos un mock, pero puedes configurar SMTP real
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email', // Servicio de testing
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  async sendVerificationCode(email: string, code: string, language: string = 'es'): Promise<boolean> {
    try {
      const subject = language === 'es' ? 'Código de verificación' : 'Verification Code';
      const html = this.getVerificationEmailTemplate(code, language);

      const info = await this.transporter.sendMail({
        from: '"Tu E-commerce" <noreply@tuecommerce.com>',
        to: email,
        subject,
        html
      });

      this.logger.log(`Verification email sent to ${email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  private getVerificationEmailTemplate(code: string, language: string): string {
    if (language === 'es') {
      return `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Código de Verificación</h2>
          <p>Tu código de verificación es:</p>
          <div style="background: #f8f9fa; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p style="color: #666;">Este código expirará en 10 minutos.</p>
          <p style="color: #666;">Si no solicitaste este código, ignora este email.</p>
        </div>
      `;
    } else {
      return `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background: #f8f9fa; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
        </div>
      `;
    }
  }
}
