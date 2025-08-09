import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('test/smtp')
export class TestSMTPController {
  private readonly logger = new Logger(TestSMTPController.name);

  constructor(private readonly configService: ConfigService) {}

  @Get('config')
  getConfig() {
    return {
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE'),
      user: this.configService.get('SMTP_USER'),
      passwordLength: this.configService.get('SMTP_PASS')?.length || 0,
      fromEmail: this.configService.get('FROM_EMAIL'),
      appName: this.configService.get('APP_NAME')
    };
  }

  @Post('test-connection')
  async testConnection() {
    const nodemailer = require('nodemailer');
    
    try {
      const transporter = nodemailer.createTransporter({
        host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
        port: parseInt(this.configService.get('SMTP_PORT', '587')),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.logger.log('🔍 Testing SMTP connection...');
      await transporter.verify();
      this.logger.log('✅ SMTP connection successful!');
      
      return { 
        success: true, 
        message: '✅ SMTP connection verified successfully',
        config: this.getConfig()
      };
    } catch (error) {
      this.logger.error('❌ SMTP connection failed:', error);
      return { 
        success: false, 
        message: `❌ SMTP connection failed: ${error instanceof Error ? error.message : String(error)}`,
        config: this.getConfig()
      };
    }
  }
}
