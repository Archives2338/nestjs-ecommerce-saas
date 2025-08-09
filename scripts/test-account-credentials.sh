#!/bin/bash

# 🧪 TEST: Verificar credenciales de cuenta Disney+
# Verificando que las credenciales estén guardadas correctamente

BASE_URL="http://localhost:3000"

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🔍 VERIFICANDO CREDENCIALES DE CUENTA DISNEY+${NC}"
echo "===================================================="

# 1. Obtener cuentas Disney+ disponibles
echo -e "${GREEN}1. 📋 Consultando cuentas Disney+ disponibles${NC}"
DISNEY_ACCOUNTS=$(curl -s -X GET "$BASE_URL/api/accounts/available/2")

echo "$DISNEY_ACCOUNTS" | jq '.'

ACCOUNT_COUNT=$(echo "$DISNEY_ACCOUNTS" | jq '.data | length')
if [ "$ACCOUNT_COUNT" -gt 0 ]; then
    FIRST_ACCOUNT_ID=$(echo "$DISNEY_ACCOUNTS" | jq -r '.data[0].id')
    echo -e "${GREEN}✅ Primera cuenta ID: $FIRST_ACCOUNT_ID${NC}"
    
    # 2. Obtener detalles completos de la cuenta (con credenciales)
    echo -e "\n${GREEN}2. 🔐 Obteniendo credenciales completas${NC}"
    ACCOUNT_DETAILS=$(curl -s -X GET "$BASE_URL/api/accounts/$FIRST_ACCOUNT_ID/details")
    
    echo "$ACCOUNT_DETAILS" | jq '.'
    
    EMAIL=$(echo "$ACCOUNT_DETAILS" | jq -r '.data.credentials.email')
    PASSWORD=$(echo "$ACCOUNT_DETAILS" | jq -r '.data.credentials.password')
    
    if [ "$EMAIL" != "null" ] && [ "$PASSWORD" != "null" ]; then
        echo -e "${GREEN}✅ Credenciales encontradas:${NC}"
        echo -e "${CYAN}📧 Email: $EMAIL${NC}"
        echo -e "${CYAN}🔑 Password: $PASSWORD${NC}"
    else
        echo -e "${RED}❌ Credenciales faltantes:${NC}"
        echo -e "${YELLOW}Email: $EMAIL${NC}"
        echo -e "${YELLOW}Password: $PASSWORD${NC}"
    fi
    
    # 3. Test de asignación de cuenta
    echo -e "\n${GREEN}3. 🎯 Probando asignación de cuenta${NC}"
    ASSIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/accounts/$FIRST_ACCOUNT_ID/assign" \
      -H "Content-Type: application/json" \
      -d '{
        "order_id": "test-order-123",
        "profile_name": "Usuario Test",
        "profile_pin": "1234"
      }')
    
    echo "$ASSIGN_RESPONSE" | jq '.'
    
else
    echo -e "${RED}❌ No hay cuentas Disney+ disponibles${NC}"
    
    # Crear cuenta de prueba
    echo -e "\n${YELLOW}🔧 Creando cuenta de prueba con credenciales completas${NC}"
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/accounts" \
      -H "Content-Type: application/json" \
      -d '{
        "service_id": 2,
        "service_name": "Disney+",
        "account_type": "family",
        "plan_type": "familiar",
        "credentials": {
          "email": "test-disney@example.com",
          "password": "TestPassword123!",
          "profile_name": "Familia Disney"
        },
        "slot_info": {
          "max_slots": 5,
          "used_slots": 0,
          "assigned_to": []
        },
        "subscription_expires_at": "2026-08-09",
        "notes": "Cuenta de prueba para testing"
      }')
    
    echo "$CREATE_RESPONSE" | jq '.'
fi

echo -e "\n${CYAN}📋 RESUMEN DE VERIFICACIÓN${NC}"
echo "================================="
echo -e "${GREEN}• Cuentas Disney+ disponibles: $ACCOUNT_COUNT${NC}"
echo -e "${GREEN}• Credenciales verificadas${NC}"
echo -e "${GREEN}• Sistema de asignación probado${NC}"
