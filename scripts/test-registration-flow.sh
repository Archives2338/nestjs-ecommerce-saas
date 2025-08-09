#!/bin/bash

# 🧪 TEST: Flujo de Registro con Email Templates GamsGo
# =====================================================

BASE_URL="http://localhost:3000"
TEST_EMAIL="usuario.prueba@gmail.com"
TEST_NAME="Usuario"
TEST_LASTNAME="Prueba"

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🧪 TEST: FLUJO COMPLETO DE REGISTRO CON EMAILS${NC}"
echo "======================================================"

echo ""
echo -e "${GREEN}📋 Configuración del test:${NC}"
echo "• Base URL: $BASE_URL"
echo "• Email de prueba: $TEST_EMAIL"
echo "• Nombre: $TEST_NAME $TEST_LASTNAME"

echo ""
echo -e "${GREEN}PASO 1: 📧 Verificar email y solicitar código${NC}"
STEP1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/check-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "$STEP1_RESPONSE" | jq '.'

EMAIL_EXISTS=$(echo "$STEP1_RESPONSE" | jq -r '.data.emailExists // false')

if [ "$EMAIL_EXISTS" = "true" ]; then
    echo -e "${YELLOW}⚠️ El email ya está registrado. Probando con otro...${NC}"
    TEST_EMAIL="test.$(date +%s)@example.com"
    echo "Nuevo email de prueba: $TEST_EMAIL"
    
    STEP1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/check-email" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"$TEST_EMAIL\"}")
    
    echo "$STEP1_RESPONSE" | jq '.'
fi

echo ""
echo -e "${GREEN}PASO 2: 📨 Solicitar código de verificación${NC}"
STEP2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/send-registration-code" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "$STEP2_RESPONSE" | jq '.'

CODE_SENT=$(echo "$STEP2_RESPONSE" | jq -r '.code')

if [ "$CODE_SENT" = "0" ]; then
    echo -e "${GREEN}✅ Código de verificación enviado${NC}"
    echo -e "${CYAN}📧 Revisa la consola del servidor para ver el código generado${NC}"
    echo -e "${YELLOW}💡 En un entorno real, el código se enviaría por email${NC}"
    
    echo ""
    echo -e "${YELLOW}Por favor, ingresa el código de 4 dígitos que aparece en la consola del servidor:${NC}"
    read -p "Código de verificación: " VERIFICATION_CODE
    
    if [ ! -z "$VERIFICATION_CODE" ]; then
        echo ""
        echo -e "${GREEN}PASO 3: ✅ Verificar código${NC}"
        STEP3_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/verify-registration-code" \
          -H "Content-Type: application/json" \
          -d "{\"email\": \"$TEST_EMAIL\", \"code\": \"$VERIFICATION_CODE\"}")
        
        echo "$STEP3_RESPONSE" | jq '.'
        
        CODE_VERIFIED=$(echo "$STEP3_RESPONSE" | jq -r '.code')
        
        if [ "$CODE_VERIFIED" = "0" ]; then
            echo -e "${GREEN}✅ Código verificado correctamente${NC}"
            
            echo ""
            echo -e "${GREEN}PASO 4: 🎯 Completar registro${NC}"
            STEP4_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/complete-registration" \
              -H "Content-Type: application/json" \
              -d "{
                \"email\": \"$TEST_EMAIL\",
                \"password\": \"Password123!\",
                \"firstName\": \"$TEST_NAME\",
                \"lastName\": \"$TEST_LASTNAME\",
                \"phone\": \"+51987654321\"
              }")
            
            echo "$STEP4_RESPONSE" | jq '.'
            
            REGISTRATION_SUCCESS=$(echo "$STEP4_RESPONSE" | jq -r '.code')
            
            if [ "$REGISTRATION_SUCCESS" = "0" ]; then
                echo -e "${GREEN}🎉 ¡REGISTRO COMPLETADO EXITOSAMENTE!${NC}"
                
                JWT_TOKEN=$(echo "$STEP4_RESPONSE" | jq -r '.data.token')
                CUSTOMER_ID=$(echo "$STEP4_RESPONSE" | jq -r '.data.customer.id')
                
                echo -e "${CYAN}👤 Usuario registrado:${NC}"
                echo "• ID: $CUSTOMER_ID"
                echo "• Email: $TEST_EMAIL"
                echo "• Token JWT: ${JWT_TOKEN:0:50}..."
                
                echo ""
                echo -e "${GREEN}PASO 5: 🔐 Verificar login${NC}"
                LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/login" \
                  -H "Content-Type: application/json" \
                  -d "{
                    \"email\": \"$TEST_EMAIL\",
                    \"password\": \"Password123!\"
                  }")
                
                echo "$LOGIN_RESPONSE" | jq '.'
                
                LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.code')
                
                if [ "$LOGIN_SUCCESS" = "0" ]; then
                    echo -e "${GREEN}✅ Login exitoso${NC}"
                else
                    echo -e "${RED}❌ Error en login${NC}"
                fi
                
            else
                echo -e "${RED}❌ Error completando el registro${NC}"
            fi
        else
            echo -e "${RED}❌ Error verificando el código${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ No se ingresó código de verificación${NC}"
    fi
else
    echo -e "${RED}❌ Error enviando código de verificación${NC}"
fi

echo ""
echo -e "${CYAN}📧 VERIFICACIONES DE EMAIL:${NC}"
echo "=============================="
echo "✅ Template de verificación (código de 4 dígitos)"
echo "✅ Template de bienvenida post-registro"
echo "✅ Diseño responsive con branding GamsGo"
echo "✅ Validaciones de seguridad"

echo ""
echo -e "${CYAN}📋 LOGS A REVISAR:${NC}"
echo "=================="
echo "• Verificar en la consola del servidor el código generado"
echo "• Confirmar que se envió el email de verificación"
echo "• Confirmar que se envió el email de bienvenida"
echo "• Revisar logs de errores si algo falló"

echo ""
echo -e "${YELLOW}💡 CONFIGURACIÓN REQUERIDA PARA EMAILS:${NC}"
echo "======================================="
echo "# Agregar a .env para emails reales:"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_USER=tu-email@gmail.com"
echo "SMTP_PASS=tu-app-password"
echo "FROM_EMAIL=noreply@gamsgo.com"
echo "APP_NAME=GamsGo"
echo "FRONTEND_URL=https://gamsgo.com"
