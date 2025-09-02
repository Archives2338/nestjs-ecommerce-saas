#!/bin/bash

# 🚀 Test Rápido del Sistema de Pricing Modular con Autenticación
# Prueba básica para verificar que todo funciona

echo "🚀 =================================="
echo "   TEST RÁPIDO PRICING MODULAR"
echo "=================================="

BASE_URL="http://localhost:3000/api"
SERVICE_ID="68903254d69fe657139074f2"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Función para obtener token
get_token() {
    echo -e "${CYAN}🔐 Obteniendo token...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"username": "admin", "password": "password"}')
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // empty' 2>/dev/null)
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Token obtenido${NC}"
        return 0
    else
        echo -e "${RED}❌ Error al obtener token${NC}"
        exit 1
    fi
}

# Función para mostrar respuesta
show_response() {
    echo -e "${BLUE}Respuesta:${NC}"
    echo "$1" | jq '.' 2>/dev/null || echo "$1"
    echo ""
}

# Obtener token
get_token
AUTH_HEADER="Authorization: Bearer $TOKEN"

echo ""
echo -e "${YELLOW}📅 Testeando Month Options...${NC}"

# Crear opción de 1 mes
echo -e "${CYAN}🔹 Creando 1 mes...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/admin/services/month-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "month": 1,
    "month_content": "1 mes",
    "sort": 1,
    "is_default": true,
    "active": true
  }')
show_response "$RESPONSE"

# Listar opciones de meses
echo -e "${CYAN}🔹 Listando month options...${NC}"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/admin/services/month-options/service/$SERVICE_ID")
show_response "$RESPONSE"

echo ""
echo -e "${YELLOW}📺 Testeando Screen Options...${NC}"

# Crear opción de 1 pantalla
echo -e "${CYAN}🔹 Creando 1 pantalla...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/admin/services/screen-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "max_user": 1,
    "substitute_recharge": 0,
    "screen": 1,
    "screen_content": "1 perfil",
    "seat_type": "Individual",
    "sort": 1,
    "is_default": true,
    "active": true
  }')
show_response "$RESPONSE"

# Listar opciones de pantallas
echo -e "${CYAN}🔹 Listando screen options...${NC}"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/admin/services/screen-options/service/$SERVICE_ID")
show_response "$RESPONSE"

echo ""
echo -e "${YELLOW}💰 Testeando Service Plans...${NC}"

# Crear plan básico
echo -e "${CYAN}🔹 Creando plan básico...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/admin/services/plans/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "month_id": 1,
    "screen_id": 1,
    "plan_type": "plan",
    "currency_icon1": "S/",
    "currency_icon2": "PEN",
    "currency_show_type": 1,
    "original_price": 9.99,
    "sale_price": 7.99,
    "average_price": 7.99,
    "discount": "20%",
    "sort": 1,
    "active": true
  }')
show_response "$RESPONSE"

# Listar planes
echo -e "${CYAN}🔹 Listando service plans...${NC}"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/admin/services/plans/service/$SERVICE_ID")
show_response "$RESPONSE"

echo ""
echo -e "${YELLOW}🎯 Testeando Pricing Integration...${NC}"

# Matriz de precios
echo -e "${CYAN}🔹 Obteniendo matriz de precios...${NC}"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/admin/services/plans/matrix/$SERVICE_ID")
show_response "$RESPONSE"

# Combinaciones faltantes
echo -e "${CYAN}🔹 Verificando combinaciones faltantes...${NC}"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/admin/services/plans/missing/$SERVICE_ID")
show_response "$RESPONSE"

# Estadísticas
echo -e "${CYAN}🔹 Obteniendo estadísticas...${NC}"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/admin/services/plans/stats/$SERVICE_ID")
show_response "$RESPONSE"

echo ""
echo -e "${GREEN}🎉 ===============================
   TEST RÁPIDO COMPLETADO
===============================${NC}"

echo -e "${BLUE}📋 Para pruebas completas ejecuta:${NC}"
echo "   ./scripts/test-pricing-system-complete.sh"
echo ""
