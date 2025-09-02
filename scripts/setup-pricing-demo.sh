#!/bin/bash

# Script completo para configurar y probar el sistema de pricing modular
# Este script configura todo automáticamente

echo "🚀 Configuración automática del sistema de pricing modular..."

# Variables
API_BASE="http://localhost:3000/api"

echo "📡 1. Verificando conectividad del servidor..."
if ! curl -s http://localhost:3000/api > /dev/null; then
    echo "❌ Error: El servidor no está corriendo en puerto 3000"
    echo "   Ejecuta primero: npm run start:dev"
    exit 1
fi
echo "✅ Servidor conectado"

echo ""
echo "🎮 2. Creando servicio MetelePlay para la demo..."

# Crear un servicio de ejemplo
SERVICE_RESPONSE=$(curl -s -X POST "$API_BASE/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MetelePlay Premium",
    "description": "Servicio de streaming premium con múltiples pantallas",
    "type": "streaming",
    "status": "active",
    "pricing_type": "modular"
  }')

# Extraer el ID del servicio
SERVICE_ID=$(echo $SERVICE_RESPONSE | jq -r '.data._id // .data.id // ._id // .id')

if [ "$SERVICE_ID" = "null" ] || [ -z "$SERVICE_ID" ]; then
    echo "❌ Error creando servicio. Respuesta:"
    echo $SERVICE_RESPONSE | jq '.'
    exit 1
fi

echo "✅ Servicio creado con ID: $SERVICE_ID"

echo ""
echo "📅 3. Creando opciones de meses..."

# Crear opciones de meses
MONTHS_DATA='[
  {"month": 1, "month_content": "1 Mes", "sort": 1, "is_default": true, "active": true},
  {"month": 3, "month_content": "3 Meses", "sort": 2, "is_default": false, "active": true},
  {"month": 12, "month_content": "12 Meses", "sort": 3, "is_default": false, "active": true}
]'

MONTH_IDS=()
for row in $(echo "${MONTHS_DATA}" | jq -r '.[] | @base64'); do
    _jq() {
     echo ${row} | base64 --decode | jq -r ${1}
    }
    
    MONTH_DATA=$(echo ${row} | base64 --decode)
    MONTH_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/month-options/$SERVICE_ID" \
      -H "Content-Type: application/json" \
      -d "$MONTH_DATA")
    
    MONTH_ID=$(echo $MONTH_RESPONSE | jq -r '.data.month_id // .month_id')
    MONTH_IDS+=($MONTH_ID)
    echo "   📅 Mes $(_jq '.month'): ID $MONTH_ID"
done

echo ""
echo "📺 4. Creando opciones de pantallas..."

# Crear opciones de pantallas
SCREENS_DATA='[
  {"max_user": 1, "substitute_recharge": 0, "screen": 1, "screen_content": "1 Pantalla", "seat_type": "personal", "sort": 1, "is_default": true, "active": true},
  {"max_user": 2, "substitute_recharge": 1, "screen": 2, "screen_content": "2 Pantallas", "seat_type": "familiar", "sort": 2, "is_default": false, "active": true},
  {"max_user": 4, "substitute_recharge": 2, "screen": 4, "screen_content": "4 Pantallas", "seat_type": "premium", "sort": 3, "is_default": false, "active": true}
]'

SCREEN_IDS=()
for row in $(echo "${SCREENS_DATA}" | jq -r '.[] | @base64'); do
    _jq() {
     echo ${row} | base64 --decode | jq -r ${1}
    }
    
    SCREEN_DATA=$(echo ${row} | base64 --decode)
    SCREEN_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/screen-options/$SERVICE_ID" \
      -H "Content-Type: application/json" \
      -d "$SCREEN_DATA")
    
    SCREEN_ID=$(echo $SCREEN_RESPONSE | jq -r '.data.screen_id // .screen_id')
    SCREEN_IDS+=($SCREEN_ID)
    echo "   🖥️ $(_jq '.screen') pantalla(s): ID $SCREEN_ID"
done

echo ""
echo "💰 5. Creando planes de precios en soles peruanos..."

# Matriz de precios en soles
declare -A PRICING_MATRIX
PRICING_MATRIX[1,1]="44.90,34.90,22%"   # 1 mes, 1 pantalla
PRICING_MATRIX[1,2]="64.90,49.90,23%"   # 1 mes, 2 pantallas  
PRICING_MATRIX[1,3]="84.90,64.90,24%"   # 1 mes, 4 pantallas
PRICING_MATRIX[2,1]="134.70,94.90,30%"  # 3 meses, 1 pantalla
PRICING_MATRIX[2,2]="194.70,139.90,28%" # 3 meses, 2 pantallas
PRICING_MATRIX[2,3]="254.70,184.90,27%" # 3 meses, 4 pantallas
PRICING_MATRIX[3,1]="538.80,349.90,35%" # 12 meses, 1 pantalla
PRICING_MATRIX[3,2]="778.80,499.90,36%" # 12 meses, 2 pantallas
PRICING_MATRIX[3,3]="1018.80,649.90,36%" # 12 meses, 4 pantallas

PLAN_COUNT=0
for month_idx in 1 2 3; do
    for screen_idx in 1 2 3; do
        month_id=${MONTH_IDS[$((month_idx-1))]}
        screen_id=${SCREEN_IDS[$((screen_idx-1))]}
        
        IFS=',' read -ra PRICES <<< "${PRICING_MATRIX[$month_idx,$screen_idx]}"
        original_price=${PRICES[0]}
        sale_price=${PRICES[1]}
        discount=${PRICES[2]}
        
        # Calcular precio promedio
        case $month_idx in
            1) months=1 ;;
            2) months=3 ;;
            3) months=12 ;;
        esac
        average_price=$(echo "scale=2; $sale_price / $months" | bc -l)
        
        PLAN_RESPONSE=$(curl -s -X POST "$API_BASE/admin/services/plans/$SERVICE_ID" \
          -H "Content-Type: application/json" \
          -d "{
            \"month_id\": $month_id,
            \"screen_id\": $screen_id,
            \"plan_type\": \"plan\",
            \"currency_icon1\": \"S/\",
            \"currency_icon2\": \"PEN\",
            \"currency_show_type\": 1,
            \"original_price\": $original_price,
            \"sale_price\": $sale_price,
            \"average_price\": $average_price,
            \"discount\": \"$discount\",
            \"sort\": $((++PLAN_COUNT)),
            \"active\": true
          }")
        
        PLAN_ID=$(echo $PLAN_RESPONSE | jq -r '.data.type_plan_id // .type_plan_id')
        
        case $screen_idx in
            1) screens="1 pantalla" ;;
            2) screens="2 pantallas" ;;
            3) screens="4 pantallas" ;;
        esac
        
        echo "   💳 Plan $months mes(es) + $screens: S/ $sale_price (ID: $PLAN_ID)"
    done
done

echo ""
echo "📊 6. Resumen de la configuración..."

echo "   🎮 Servicio: MetelePlay Premium (ID: $SERVICE_ID)"
echo "   📅 Opciones de meses: ${#MONTH_IDS[@]} creadas"
echo "   📺 Opciones de pantallas: ${#SCREEN_IDS[@]} creadas" 
echo "   💰 Planes de precios: $PLAN_COUNT creados"

echo ""
echo "🔍 7. Consultando matriz de precios..."

MATRIX_RESPONSE=$(curl -s -X GET "$API_BASE/admin/services/plans/matrix/$SERVICE_ID")
echo $MATRIX_RESPONSE | jq '.'

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "🎯 Próximos pasos recomendados:"
echo "1. 📱 Crear interfaz de usuario para mostrar los planes"
echo "2. 🛒 Integrar con sistema de órdenes/compras"
echo "3. 💳 Configurar pasarelas de pago"
echo "4. 📊 Crear dashboard de analytics"
echo "5. 🧪 Realizar testing de integración"

echo ""
echo "🔧 URLs útiles:"
echo "   API Base: $API_BASE"
echo "   Servicio: $API_BASE/services/$SERVICE_ID"
echo "   Planes: $API_BASE/admin/services/plans/service/$SERVICE_ID"
echo "   Matriz: $API_BASE/admin/services/plans/matrix/$SERVICE_ID"
