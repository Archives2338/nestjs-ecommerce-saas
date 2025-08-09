import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Diagnóstico de variables de entorno
      this.logger.log('🔍 Diagnóstico de Email Service:');
      this.logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
      this.logger.log(`SMTP_USER: ${process.env.SMTP_USER || 'NO CONFIGURADO'}`);
      this.logger.log(`SMTP_PASS: ${process.env.SMTP_PASS ? 'CONFIGURADO (' + process.env.SMTP_PASS.length + ' chars)' : 'NO CONFIGURADO'}`);
      this.logger.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NO CONFIGURADO'}`);
      this.logger.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NO CONFIGURADO'}`);
      
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Configuración Gmail con App Password
        this.logger.log('✅ SMTP credentials found, initializing Gmail SMTP transporter');
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        this.logger.log('✅ Gmail SMTP transporter created successfully');
      } else {
        // Modo desarrollo sin SMTP
        this.logger.warn('🚨 No SMTP credentials found. Emails will be logged only (development mode)');
        this.transporter = null;
      }
    } catch (error) {
      this.logger.error('Error initializing email transporter:', error);
      this.transporter = null;
    }
  }

  async sendVerificationCode(email: string, code: string, language: string = 'es'): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn(`📧 [DEV MODE] Verification email for ${email}:`);
        this.logger.warn(`🔢 Code: ${code}`);
        this.logger.warn(`🌐 Language: ${language}`);
        this.logger.warn('💡 Configure SMTP_USER and SMTP_PASS for real email sending');
        return true; // Simulate success in development
      }

      const subject = language === 'es' ? 'Código de verificación - GamsGo' : 'Verification Code - GamsGo';
      const html = this.getVerificationEmailTemplate(code, language);

      const info = await this.transporter.sendMail({
        from: `"${process.env.APP_NAME || 'GamsGo'}" <${process.env.FROM_EMAIL || 'noreply@gamsgo.com'}>`,
        to: email,
        subject,
        html
      });

      this.logger.log(`✅ Verification email sent to ${email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  private getVerificationEmailTemplate(code: string, language: string): string {
    if (language === 'es') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificación - GamsGo</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <img src="https://gamsgo.oss-us-east-1.aliyuncs.com/GamsGo.png" width="150" height="25" alt="GamsGo" style="margin-bottom: 20px;" />
              <h1 style="color: white; margin: 0; font-size: 24px;">Código de Verificación</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
                Tu código de verificación para GamsGo es:
              </p>
              
              <div style="background: #f8f9fa; border: 3px dashed #28a745; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <h1 style="color: #28a745; font-size: 48px; margin: 0; letter-spacing: 8px; font-weight: bold;">${code}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                • Este código expirará en <strong>10 minutos</strong><br>
                • Si no solicitaste este código, ignora este email<br>
                • Para tu seguridad, no compartas este código con nadie
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © ${new Date().getFullYear()} GamsGo. Todos los derechos reservados.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code - GamsGo</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <img src="https://gamsgo.oss-us-east-1.aliyuncs.com/GamsGo.png" width="150" height="25" alt="GamsGo" style="margin-bottom: 20px;" />
              <h1 style="color: white; margin: 0; font-size: 24px;">Verification Code</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
                Your verification code for GamsGo is:
              </p>
              
              <div style="background: #f8f9fa; border: 3px dashed #28a745; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <h1 style="color: #28a745; font-size: 48px; margin: 0; letter-spacing: 8px; font-weight: bold;">${code}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                • This code will expire in <strong>10 minutes</strong><br>
                • If you didn't request this code, please ignore this email<br>
                • For your security, don't share this code with anyone
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © ${new Date().getFullYear()} GamsGo. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `;
    }
  }
}
