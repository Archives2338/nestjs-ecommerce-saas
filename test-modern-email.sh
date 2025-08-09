#!/bin/bash

# Test script para el nuevo sistema de emails con @nestjs-modules/mailer
echo "🧪 Testing ModernEmailService with Gmail SMTP..."

# 1. Test de verificación de email
echo "📧 Testing verification email..."
curl -X POST http://localhost:3000/test/email/verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Usuario Prueba",
    "verificationCode": "1234"
  }'

echo ""
echo "---"

# 2. Test de email de bienvenida
echo "🎉 Testing welcome email..."
curl -X POST http://localhost:3000/test/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Usuario Prueba",
    "serviceName": "Disney Plus",
    "planName": "Plan Familiar"
  }'

echo ""
echo "---"

# 3. Test de credenciales
echo "🔑 Testing credentials email..."
curl -X POST http://localhost:3000/test/email/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Usuario Prueba",
    "serviceName": "Disney Plus",
    "planName": "Plan Familiar",
    "orderNumber": "ORD-123456",
    "profileName": "Perfil Principal",
    "credentials": {
      "email": "disney.family@example.com",
      "password": "SecurePass123"
    }
  }'

echo ""
echo "✅ Test completed! Check your email logs in the terminal."
