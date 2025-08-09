// 🔧 Script para diagnóstico de email
import { GamsGoEmailService } from './src/email/email.service.example';

async function diagnosticEmail() {
  console.log('🔍 Diagnóstico del sistema de email...\n');
  
  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'No configurado'}`);
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL}\n`);
  
  // Crear servicio de email
  const emailService = new GamsGoEmailService();
  
  // Probar envío
  console.log('📧 Probando envío de email...');
  try {
    const result = await emailService.sendVerificationEmail('meteleplay.pe@gmail.com', {
      userName: 'Test User',
      verificationCode: '1234',
      verificationUrl: 'https://test.com/verify',
      expiresIn: '10 minutos'
    });
    
    console.log(`Resultado: ${result ? '✅ Exitoso' : '❌ Falló'}`);
  } catch (error) {
    console.error('❌ Error detallado:', error.message);
  }
}

// Cargar variables de entorno
require('dotenv').config();
diagnosticEmail();
