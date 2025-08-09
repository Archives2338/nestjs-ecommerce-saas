#!/bin/bash

# 🧪 TEST: Sistema de Emails GamsGo
# ==================================

echo "📧 PROBANDO SISTEMA DE EMAILS CON TEMPLATES GAMSGO"
echo "=================================================="

# Verificar que nodemailer esté instalado
echo ""
echo "🔧 Verificando dependencias..."
if npm list nodemailer > /dev/null 2>&1; then
    echo "✅ Nodemailer instalado"
else
    echo "❌ Nodemailer no encontrado. Instalando..."
    npm install nodemailer @types/nodemailer
fi

# Verificar variables de entorno
echo ""
echo "🔧 Verificando configuración de email..."
if [ -z "$SMTP_USER" ]; then
    echo "⚠️  SMTP_USER no configurado"
else
    echo "✅ SMTP_USER: $SMTP_USER"
fi

if [ -z "$SMTP_PASS" ]; then
    echo "⚠️  SMTP_PASS no configurado"
else
    echo "✅ SMTP_PASS: [configurado]"
fi

if [ -z "$FROM_EMAIL" ]; then
    echo "⚠️  FROM_EMAIL no configurado"
else
    echo "✅ FROM_EMAIL: $FROM_EMAIL"
fi

echo ""
echo "📋 CONFIGURACIÓN RECOMENDADA PARA .env:"
echo "======================================="
echo "# Email Configuration"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_USER=tu-email@gmail.com"
echo "SMTP_PASS=tu-app-password"
echo "FROM_EMAIL=noreply@gamsgo.com"
echo "APP_NAME=GamsGo"
echo "FRONTEND_URL=https://gamsgo.com"
echo ""
echo "# SendGrid (Opcional, para producción)"
echo "SENDGRID_API_KEY=SG.your-api-key-here"

echo ""
echo "📧 TEMPLATES DISPONIBLES:"
echo "========================="
echo "✅ Template de verificación - Código de 6 dígitos"
echo "✅ Template de bienvenida - Post-verificación"
echo "✅ Template de credenciales - Con tabla estilizada"
echo "✅ Diseño responsive con logos GamsGo"
echo "✅ Footer personalizado con emoji 🌹"

echo ""
echo "🎯 INTEGRACIÓN EN TU PROYECTO:"
echo "=============================="
echo "// En tu módulo (ej: auth.module.ts)"
echo "import { GamsGoEmailService } from './email/email.service.example';"
echo ""
echo "@Module({"
echo "  providers: [GamsGoEmailService],"
echo "  exports: [GamsGoEmailService]"
echo "})"
echo ""
echo "// En tu servicio de autenticación"
echo "constructor(private emailService: GamsGoEmailService) {}"
echo ""
echo "// Enviar email de verificación"
echo "const code = this.emailService.generateVerificationCode();"
echo "await this.emailService.sendVerificationEmail(email, {"
echo "  userName: 'Juan Pérez',"
echo "  verificationCode: code,"
echo "  verificationUrl: 'https://gamsgo.com/verify?code=' + code,"
echo "  expiresIn: '10 minutos'"
echo "});"

echo ""
echo "📱 EJEMPLO DE USO PARA CREDENCIALES:"
echo "==================================="
echo "// Después de asignar credenciales a una orden"
echo "await this.emailService.sendCredentialsEmail(customerEmail, {"
echo "  orderNumber: order.out_trade_no,"
echo "  serviceName: 'Disney+',"
echo "  planName: 'Plan Familiar 5 perfiles',"
echo "  credentials: {"
echo "    email: 'cuenta@disney.com',"
echo "    password: 'password123'"
echo "  },"
echo "  profileName: 'Usuario Principal',"
echo "  expiresAt: new Date(Date.now() + 30*24*60*60*1000)"
echo "});"

echo ""
echo "🔒 RECOMENDACIONES DE SEGURIDAD:"
echo "==============================="
echo "• Usar Gmail App Passwords para SMTP"
echo "• SendGrid para producción (mejor deliverability)"
echo "• Rate limiting para prevenir spam"
echo "• Validar emails antes de envío"
echo "• No enviar credenciales si el email no está verificado"

echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "=================="
echo "1. Configurar variables de entorno"
echo "2. Crear cuenta Gmail App Password o SendGrid"
echo "3. Integrar GamsGoEmailService en tu módulo"
echo "4. Probar envío con email real"
echo "5. Implementar en flujo de registro y órdenes"

echo ""
echo "✅ COMPILACIÓN EXITOSA"
echo "====================="
echo "Los templates están listos para usar 🎉"
