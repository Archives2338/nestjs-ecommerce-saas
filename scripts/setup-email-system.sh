#!/bin/bash

# 📧 INSTALACIÓN: Sistema de Emails con Templates GamsGo
# =======================================================

echo "🚀 INSTALANDO DEPENDENCIAS DE EMAIL"
echo "===================================="

# Instalar nodemailer
echo "📦 Instalando nodemailer..."
npm install nodemailer @types/nodemailer

# Instalar SendGrid (opcional, recomendado para producción)
echo "📦 Instalando SendGrid..."
npm install @sendgrid/mail

echo ""
echo "✅ DEPENDENCIAS INSTALADAS"
echo "========================="

echo ""
echo "🔧 CONFIGURACIÓN REQUERIDA EN .env"
echo "=================================="
echo ""
echo "# Email Configuration"
echo "SENDGRID_API_KEY=SG.your-sendgrid-api-key-here"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_USER=your-email@gmail.com"
echo "SMTP_PASS=your-app-password"
echo "FROM_EMAIL=noreply@gamsgo.com"
echo "APP_NAME=GamsGo"
echo "FRONTEND_URL=https://gamsgo.com"

echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "=================="
echo "1. ✅ Configurar variables de entorno en .env"
echo "2. ✅ Crear cuenta en SendGrid (recomendado)"
echo "3. ✅ Verificar dominio para mejor deliverability"
echo "4. ✅ Integrar GamsGoEmailService en tu módulo"
echo "5. ✅ Probar envío de emails"

echo ""
echo "🧪 COMANDOS DE PRUEBA:"
echo "======================"
echo "# Probar configuración SMTP"
echo "node -e \"const nodemailer = require('nodemailer'); console.log('✅ Nodemailer instalado correctamente');\""

echo ""
echo "🎨 TEMPLATES CREADOS:"
echo "===================="
echo "✅ Template de verificación (estilo GamsGo)"
echo "✅ Template de bienvenida (estilo GamsGo)"
echo "✅ Template de credenciales (estilo GamsGo)"
echo "✅ Estilos CSS inline responsivos"
echo "✅ Logo y branding de GamsGo"
echo "✅ Footer con copyright"

echo ""
echo "📧 CARACTERÍSTICAS:"
echo "==================="
echo "• 📱 Responsive design"
echo "• 🎨 Colores y estilos de GamsGo"
echo "• 🔒 Códigos de verificación de 6 dígitos"
echo "• ⚠️  Avisos de seguridad"
echo "• 🌹 Footer personalizado con emoji"
echo "• 📋 Tabla de credenciales estilizada"
echo "• 🔐 Instrucciones de uso seguro"

echo ""
echo "💡 CONSEJOS DE IMPLEMENTACIÓN:"
echo "=============================="
echo "• Usar SendGrid para producción (mejor deliverability)"
echo "• Configurar dominio propio para emails"
echo "• Implementar rate limiting para evitar spam"
echo "• Validar emails antes de envío"
echo "• Guardar logs de emails enviados"
echo "• Manejar bounces y unsubscribes"

echo ""
echo "🎯 FLUJO RECOMENDADO:"
echo "===================="
echo "1. Usuario se registra → Email verificación"
echo "2. Usuario verifica → Email bienvenida"
echo "3. Usuario compra → Email confirmación"
echo "4. Pago aprobado → Email credenciales"
echo "5. Próximo a expirar → Email recordatorio"
