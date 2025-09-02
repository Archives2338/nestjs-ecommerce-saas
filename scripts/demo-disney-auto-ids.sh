#!/bin/bash

# Script completo de demo Disney+ con generación automática de IDs

echo "🎬 Demo completo de Disney+ con generación automática de IDs..."

# Variables
API_BASE="http://localhost:3000/api"
SERVICE_ID="68903254d69fe657139074f2"  # Disney+ ID

echo ""
echo "🔑 1. Obteniendo token de administrador..."

# Intentar login (necesitarás credenciales válidas)
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/admin-auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meteleplay.com",
    "password": "admin123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extraer token (ajusta según tu estructura de respuesta)
ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token // .access_token // .token' 2>/dev/null)

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo "❌ No se pudo obtener token. Usando token manual..."
    echo "   Actualiza las credenciales de login o proporciona un token válido"
    
    # Solicitar token manualmente
    echo ""
    echo "🔑 Introduce tu token de admin:"
    read -r ADMIN_TOKEN
    
    if [ -z "$ADMIN_TOKEN" ]; then
        echo "❌ Token requerido. Saliendo..."
        exit 1
    fi
else
    echo "✅ Token obtenido: ${ADMIN_TOKEN:0:20}..."
fi

echo ""
echo "📅 2. Creando opciones de meses con IDs automáticos..."

# Crear opción de 1 mes
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

echo "Respuesta: $MONTH_1_RESPONSE"
MONTH_ID_1=$(echo $MONTH_1_RESPONSE | jq -r '.data.month_id // .month_id' 2>/dev/null)

if [ "$MONTH_ID_1" = "null" ] || [ -z "$MONTH_ID_1" ]; then
    echo "❌ Error creando opción de 1 mes"
    exit 1
fi

echo "✅ Mes 1 creado con ID: $MONTH_ID_1"

# Crear opción de 3 meses
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

echo "Respuesta: $MONTH_3_RESPONSE"
MONTH_ID_3=$(echo $MONTH_3_RESPONSE | jq -r '.data.month_id // .month_id' 2>/dev/null)

if [ "$MONTH_ID_3" = "null" ] || [ -z "$MONTH_ID_3" ]; then
    echo "❌ Error creando opción de 3 meses"
    exit 1
fi

echo "✅ Mes 3 creado con ID: $MONTH_ID_3"

echo ""
echo "📺 3. Creando opciones de pantallas con IDs automáticos..."

# Crear opción de 1 pantalla
echo "   🖥️ Creando opción de 1 perfil..."
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

echo "Respuesta: $SCREEN_1_RESPONSE"
SCREEN_ID_1=$(echo $SCREEN_1_RESPONSE | jq -r '.data.screen_id // .screen_id' 2>/dev/null)

if [ "$SCREEN_ID_1" = "null" ] || [ -z "$SCREEN_ID_1" ]; then
    echo "❌ Error creando opción de pantalla"
    exit 1
fi

echo "✅ Pantalla 1 creada con ID: $SCREEN_ID_1"

echo ""
echo "💰 4. Creando planes de precios usando IDs generados..."

# Plan 1 mes + 1 perfil
echo "   💳 Creando plan Disney+ 1 mes..."
PLAN_1_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/plans/$SERVICE_ID" \
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
  }")

echo "Respuesta: $PLAN_1_RESPONSE"
PLAN_ID_1=$(echo $PLAN_1_RESPONSE | jq -r '.data.type_plan_id // .type_plan_id' 2>/dev/null)

# Plan 3 meses + 1 perfil
echo "   💳 Creando plan Disney+ 3 meses..."
PLAN_3_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/plans/$SERVICE_ID" \
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
  }")

echo "Respuesta: $PLAN_3_RESPONSE"
PLAN_ID_3=$(echo $PLAN_3_RESPONSE | jq -r '.data.type_plan_id // .type_plan_id' 2>/dev/null)

echo ""
echo "🎯 5. Verificando matriz de precios..."
MATRIX_RESPONSE=$(curl -s -X GET "$API_BASE/admin/services/plans/matrix/$SERVICE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Matriz de precios:"
echo $MATRIX_RESPONSE | jq '.'

echo ""
echo "📊 6. Resumen de IDs generados automáticamente:"
echo "   🎬 Servicio Disney+: $SERVICE_ID"
echo "   📅 Mes 1: $MONTH_ID_1"
echo "   📅 Mes 3: $MONTH_ID_3"
echo "   📺 Pantalla 1: $SCREEN_ID_1"
echo "   💳 Plan 1 mes: $PLAN_ID_1"
echo "   💳 Plan 3 meses: $PLAN_ID_3"

echo ""
echo "✅ ¡Demo de Disney+ completado exitosamente!"
echo ""
echo "🎯 Beneficios del sistema automático:"
echo "   🤖 IDs generados automáticamente"
echo "   🔒 Sin colisiones de IDs"
echo "   📈 Escalable para múltiples servicios"
echo "   👥 Múltiples admins pueden trabajar simultáneamente"
echo ""
echo "🔗 URLs de consulta:"
echo "   Matriz: $API_BASE/admin/services/plans/matrix/$SERVICE_ID"
echo "   Planes: $API_BASE/admin/services/plans/service/$SERVICE_ID"
