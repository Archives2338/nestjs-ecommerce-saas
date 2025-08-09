import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EmailDemoService } from './src/email/email-demo.service';

async function testEmailSystem() {
  console.log('🧪 Iniciando prueba del sistema de emails...\n');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailDemoService = app.get(EmailDemoService);

  try {
    // Test 1: Email de verificación
    console.log('📧 Probando email de verificación...');
    const result1 = await emailDemoService.sendUserVerification(
      'jesusalejandrorojasponce@gmail.com', 
      'Jesús Alejandro'
    );
    console.log(`Resultado: ${result1 ? '✅ Exitoso' : '❌ Falló'}\n`);

    // Test 2: Email de bienvenida
    console.log('🎉 Probando email de bienvenida...');
    const result2 = await emailDemoService.sendWelcomeAfterVerification(
      'jesusalejandrorojasponce@gmail.com', 
      'Jesús Alejandro'
    );
    console.log(`Resultado: ${result2 ? '✅ Exitoso' : '❌ Falló'}\n`);

    // Test 3: Email de credenciales
    console.log('🔑 Probando email de credenciales...');
    const mockOrderData = {
      out_trade_no: 'TEST-123456789',
      service_name: 'Disney+ Premium',
      plan_name: 'Plan Familiar 5 perfiles',
      access_info: {
        access_credentials: {
          email: 'disney.test@example.com',
          password: 'TestPassword123!'
        },
        profile_name: 'Jesús Alejandro'
      },
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const result3 = await emailDemoService.sendCredentialsAfterPayment(
      'jesusalejandrorojasponce@gmail.com',
      mockOrderData
    );
    console.log(`Resultado: ${result3 ? '✅ Exitoso' : '❌ Falló'}\n`);

    console.log('🎯 Pruebas completadas!');
    console.log('📬 Revisa tu bandeja de entrada: jesusalejandrorojasponce@gmail.com');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await app.close();
  }
}

testEmailSystem().catch(console.error);
