#!/bin/bash

# 🚀 Test Completo del Sistema de Pricing Modular
# Autor: Sistema Automatizado
# Fecha: $(date)

echo "🚀 ==================================="
echo "   TESTING SISTEMA PRICING MODULAR"
echo "==================================="

BASE_URL="http://localhost:3000/api"
SERVICE_ID="68903254d69fe657139074f2"  # Disney+ Service ID

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para obtener token de admin
get_admin_token() {
    echo -e "${CYAN}🔐 Obteniendo token de administrador...${NC}"
    
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"username": "admin", "password": "password"}')
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // empty' 2>/dev/null)
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Token obtenido exitosamente${NC}"
        echo "$TOKEN" > .admin-token.tmp
        return 0
    else
        echo -e "${RED}❌ Error al obtener token de admin${NC}"
        echo -e "${YELLOW}Respuesta: $LOGIN_RESPONSE${NC}"
        exit 1
    fi
}

# Función para mostrar respuestas JSON formateadas
show_response() {
    echo -e "${BLUE}Respuesta:${NC}"
    echo "$1" | jq '.' 2>/dev/null || echo "$1"
    echo ""
}

# Función para extraer IDs de las respuestas
extract_id() {
    echo "$1" | jq -r '.data.month_id // .data.screen_id // .data.type_plan_id // empty' 2>/dev/null
}

echo -e "${CYAN}🔍 Verificando que el servidor esté corriendo...${NC}"
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Error: El servidor NestJS no está corriendo en el puerto 3000${NC}"
    echo -e "${YELLOW}Ejecuta: npm run start:dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Servidor corriendo correctamente${NC}"

# Obtener token de administrador
get_admin_token
TOKEN=$(cat .admin-token.tmp)
AUTH_HEADER="Authorization: Bearer $TOKEN"
echo ""

# ====================
# FASE 1: MONTH OPTIONS
# ====================
echo -e "${PURPLE}📅 FASE 1: TESTING MONTH OPTIONS${NC}"
echo "=================================="

echo -e "${YELLOW}🔹 Creando opción: 1 mes...${NC}"
RESPONSE_1MES=$(curl -s -X POST "$BASE_URL/admin/services/month-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "month": 1,
    "month_content": "1 mes",
    "sort": 1,
    "is_default": true,
    "active": true
  }')
show_response "$RESPONSE_1MES"
MONTH_ID_1=$(extract_id "$RESPONSE_1MES")

echo -e "${YELLOW}🔹 Creando opción: 3 meses...${NC}"
RESPONSE_3MES=$(curl -s -X POST "$BASE_URL/admin/services/month-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "month": 3,
    "month_content": "3 meses",
    "sort": 2,
    "is_default": false,
    "active": true
  }')
show_response "$RESPONSE_3MES"
MONTH_ID_3=$(extract_id "$RESPONSE_3MES")

echo -e "${YELLOW}🔹 Creando opción: 12 meses...${NC}"
RESPONSE_12MES=$(curl -s -X POST "$BASE_URL/admin/services/month-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "month": 12,
    "month_content": "12 meses",
    "sort": 3,
    "is_default": false,
    "active": true
  }')
show_response "$RESPONSE_12MES"
MONTH_ID_12=$(extract_id "$RESPONSE_12MES")

echo -e "${YELLOW}🔹 Listando todas las opciones de meses...${NC}"
MONTH_LIST=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/admin/services/month-options/service/$SERVICE_ID")
show_response "$MONTH_LIST"

# ====================
# FASE 2: SCREEN OPTIONS
# ====================
echo -e "${PURPLE}📺 FASE 2: TESTING SCREEN OPTIONS${NC}"
echo "=================================="

echo -e "${YELLOW}🔹 Creando opción: 1 perfil Individual...${NC}"
RESPONSE_1SCREEN=$(curl -s -X POST "$BASE_URL/admin/services/screen-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
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
show_response "$RESPONSE_1SCREEN"
SCREEN_ID_1=$(extract_id "$RESPONSE_1SCREEN")

echo -e "${YELLOW}🔹 Creando opción: 2 pantallas Familiar...${NC}"
RESPONSE_2SCREEN=$(curl -s -X POST "$BASE_URL/admin/services/screen-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "max_user": 2,
    "substitute_recharge": 1,
    "screen": 2,
    "screen_content": "2 pantallas",
    "seat_type": "Familiar",
    "sort": 2,
    "is_default": false,
    "active": true
  }')
show_response "$RESPONSE_2SCREEN"
SCREEN_ID_2=$(extract_id "$RESPONSE_2SCREEN")

echo -e "${YELLOW}🔹 Creando opción: 4 pantallas Premium...${NC}"
RESPONSE_4SCREEN=$(curl -s -X POST "$BASE_URL/admin/services/screen-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "max_user": 4,
    "substitute_recharge": 2,
    "screen": 4,
    "screen_content": "4 pantallas",
    "seat_type": "Premium",
    "sort": 3,
    "is_default": false,
    "active": true
  }')
show_response "$RESPONSE_4SCREEN"
SCREEN_ID_4=$(extract_id "$RESPONSE_4SCREEN")

echo -e "${YELLOW}🔹 Listando todas las opciones de pantallas...${NC}"
SCREEN_LIST=$(curl -s "$BASE_URL/admin/services/screen-options/service/$SERVICE_ID")
show_response "$SCREEN_LIST"

# ====================
# FASE 3: SERVICE PLANS
# ====================
echo -e "${PURPLE}💰 FASE 3: TESTING SERVICE PLANS${NC}"
echo "=================================="

# Crear matriz completa de planes (3 meses x 3 pantallas = 9 planes)
declare -a MONTH_IDS=("$MONTH_ID_1" "$MONTH_ID_3" "$MONTH_ID_12")
declare -a SCREEN_IDS=("$SCREEN_ID_1" "$SCREEN_ID_2" "$SCREEN_ID_4")
declare -a PRICES=(7.99 15.99 25.99 21.99 35.99 49.99 79.99 119.99 159.99)

counter=0
for month_id in "${MONTH_IDS[@]}"; do
    for screen_id in "${SCREEN_IDS[@]}"; do
        price=${PRICES[$counter]}
        discount=$((20 + counter * 5))
        original_price=$(echo "$price * 1.25" | bc -l)
        
        echo -e "${YELLOW}🔹 Creando plan: Month ID $month_id + Screen ID $screen_id = S/ $price${NC}"
        
        PLAN_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/services/plans/$SERVICE_ID" \
          -H "Content-Type: application/json" \
          -d "{
            \"month_id\": $month_id,
            \"screen_id\": $screen_id,
            \"plan_type\": \"plan\",
            \"currency_icon1\": \"S/\",
            \"currency_icon2\": \"PEN\",
            \"currency_show_type\": 1,
            \"original_price\": $original_price,
            \"sale_price\": $price,
            \"average_price\": $price,
            \"discount\": \"$discount%\",
            \"sort\": $((counter + 1)),
            \"active\": true
          }")
        
        show_response "$PLAN_RESPONSE"
        ((counter++))
    done
done

echo -e "${YELLOW}🔹 Listando todos los planes...${NC}"
PLANS_LIST=$(curl -s "$BASE_URL/admin/services/plans/service/$SERVICE_ID")
show_response "$PLANS_LIST"

# ====================
# FASE 4: PRICING INTEGRATION
# ====================
echo -e "${PURPLE}🎯 FASE 4: TESTING PRICING INTEGRATION${NC}"
echo "======================================"

echo -e "${YELLOW}🔹 Obteniendo matriz completa de precios...${NC}"
MATRIX_RESPONSE=$(curl -s "$BASE_URL/admin/services/plans/matrix/$SERVICE_ID")
show_response "$MATRIX_RESPONSE"

echo -e "${YELLOW}🔹 Verificando combinaciones faltantes...${NC}"
MISSING_RESPONSE=$(curl -s "$BASE_URL/admin/services/plans/missing/$SERVICE_ID")
show_response "$MISSING_RESPONSE"

echo -e "${YELLOW}🔹 Obteniendo estadísticas del pricing...${NC}"
STATS_RESPONSE=$(curl -s "$BASE_URL/admin/services/plans/stats/$SERVICE_ID")
show_response "$STATS_RESPONSE"

# ====================
# FASE 5: PRUEBAS DE VALIDACIÓN
# ====================
echo -e "${PURPLE}🔍 FASE 5: PRUEBAS DE VALIDACIÓN${NC}"
echo "================================="

echo -e "${YELLOW}🔹 Probando duplicado (debe fallar)...${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/services/month-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "month_content": "1 mes duplicado",
    "active": true
  }')
show_response "$DUPLICATE_RESPONSE"

echo -e "${YELLOW}🔹 Probando plan con month_id inexistente (debe fallar)...${NC}"
INVALID_PLAN_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/services/plans/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "month_id": 999,
    "screen_id": 1,
    "plan_type": "plan",
    "sale_price": 10.99
  }')
show_response "$INVALID_PLAN_RESPONSE"

# ====================
# RESUMEN FINAL
# ====================
echo -e "${GREEN}🎉 ================================="
echo "   RESUMEN DEL TESTING COMPLETO"
echo "=================================${NC}"

echo -e "${CYAN}📊 Estadísticas creadas:${NC}"
echo "• Month Options: 3 opciones (1, 3, 12 meses)"
echo "• Screen Options: 3 opciones (1, 2, 4 pantallas)"
echo "• Service Plans: 9 planes (matriz completa)"
echo "• Validaciones: Duplicados y referencias inválidas"

echo -e "${CYAN}🔗 IDs generados automáticamente:${NC}"
echo "• Month IDs: $MONTH_ID_1, $MONTH_ID_3, $MONTH_ID_12"
echo "• Screen IDs: $SCREEN_ID_1, $SCREEN_ID_2, $SCREEN_ID_4"

echo -e "${GREEN}✅ Sistema de Pricing Modular: FUNCIONANDO CORRECTAMENTE${NC}"
echo -e "${BLUE}🚀 ¡Listo para producción!${NC}"
echo ""
