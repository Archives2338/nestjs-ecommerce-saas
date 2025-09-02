#!/bin/bash

# Script para probar el sistema de pricing modular
# Fase 1: Crear opciones de meses y pantallas

echo "🚀 Iniciando pruebas del sistema de pricing modular..."

# Variables
API_BASE="http://localhost:3000/api"
SERVICE_ID="68903254d69fe657139074f2"  # Disney+ ID

# Token de admin (debes obtener uno real)
# LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/admin-auth/login" \
#   -H "Content-Type: application/json" \
#   -d '{"email": "admin@example.com", "password": "password"}')

# ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token')

# Por ahora usamos un token de ejemplo (reemplaza con uno real)
ADMIN_TOKEN="tu_token_de_admin_aqui"

echo "📋 1. Creando opciones de meses para el servicio..."

# Crear opción de 1 mes (month_id se genera automáticamente)
echo "   📅 Creando opción de 1 mes..."
MONTH_1_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/month-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "month": 1,
    "month_content": "1 mes",
    "sort": 1,
    "is_default": true,
    "active": true
  }')

echo $MONTH_1_RESPONSE | jq '.'
MONTH_ID_1=$(echo $MONTH_1_RESPONSE | jq -r '.data.month_id // .month_id')

# Crear opción de 3 meses (month_id se genera automáticamente)
echo "   📅 Creando opción de 3 meses..."
MONTH_3_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/month-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "month": 3,
    "month_content": "3 meses",
    "sort": 2,
    "is_default": false,
    "active": true
  }')

echo $MONTH_3_RESPONSE | jq '.'
MONTH_ID_3=$(echo $MONTH_3_RESPONSE | jq -r '.data.month_id // .month_id')

echo ""
echo "📺 2. Creando opciones de pantallas para el servicio..."

# Crear opción de 1 pantalla (screen_id se genera automáticamente)
echo "   🖥️ Creando opción de 1 pantalla..."
SCREEN_1_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/screen-options/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
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

echo $SCREEN_1_RESPONSE | jq '.'
SCREEN_ID_1=$(echo $SCREEN_1_RESPONSE | jq -r '.data.screen_id // .screen_id')

echo ""
echo "💰 3. Creando algunos planes de precios de ejemplo..."

# Plan 1 mes + 1 pantalla (usando IDs generados automáticamente)
echo "   💳 Creando plan 1 mes + 1 pantalla..."
curl -X POST "$API_BASE/admin/services/plans/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"month_id\": $MONTH_ID_1,
    \"screen_id\": $SCREEN_ID_1,
    \"plan_type\": \"plan\",
    \"currency_icon1\": \"S/\",
    \"currency_icon2\": \"PEN\",
    \"currency_show_type\": 1,
    \"original_price\": 9.99,
    \"sale_price\": 7.99,
    \"average_price\": 7.99,
    \"discount\": \"20%\",
    \"sort\": 1,
    \"active\": true
  }" | jq '.'

# Plan 3 meses + 1 pantalla (usando IDs generados automáticamente)
echo "   💳 Creando plan 3 meses + 1 pantalla..."
curl -X POST "$API_BASE/admin/services/plans/$SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"month_id\": $MONTH_ID_3,
    \"screen_id\": $SCREEN_ID_1,
    \"plan_type\": \"plan\",
    \"currency_icon1\": \"S/\",
    \"currency_icon2\": \"PEN\",
    \"currency_show_type\": 1,
    \"original_price\": 25.99,
    \"sale_price\": 21.99,
    \"average_price\": 7.33,
    \"discount\": \"15%\",
    \"sort\": 2,
    \"active\": true
  }" | jq '.'

echo ""
echo "📊 4. Consultando datos creados..."

echo "   📋 Opciones de meses creadas:"
curl -s -X GET "$API_BASE/admin/services/month-options/service/$SERVICE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data[] | {month_id, month, month_content, is_default}'

echo ""
echo "   📺 Opciones de pantallas creadas:"
curl -s -X GET "$API_BASE/admin/services/screen-options/service/$SERVICE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data[] | {screen_id, screen, screen_content, max_user, is_default}'

echo ""
echo "   💰 Planes creados:"
curl -s -X GET "$API_BASE/admin/services/plans/service/$SERVICE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data[] | {type_plan_id, month_id, screen_id, sale_price, discount}'

echo ""
echo "🎯 5. Obteniendo matriz de precios..."
curl -s -X GET "$API_BASE/admin/services/plans/matrix/$SERVICE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

echo ""
echo "✅ ¡Prueba completada! El sistema de pricing modular está funcionando."

echo ""
echo "🔧 Para usar este script:"
echo "1. El SERVICE_ID ya está configurado para Disney+: $SERVICE_ID"
echo "2. Obtén un token de admin real y reemplaza ADMIN_TOKEN"
echo "3. Asegúrate de que el servidor esté corriendo en puerto 3000"
echo "4. Ejecuta: chmod +x test-pricing-modular.sh && ./test-pricing-modular.sh"
echo ""
echo "📋 IDs generados automáticamente:"
echo "   📅 Mes 1: $MONTH_ID_1"
echo "   📅 Mes 3: $MONTH_ID_3"
echo "   📺 Pantalla 1: $SCREEN_ID_1"
