#!/bin/bash

# Script para probar el sistema completo de órdenes
# Ejecuta pruebas API para verificar funcionalidad

BASE_URL="http://localhost:3000"
CUSTOMER_ID="673a5299e2f1234567890123"

echo "🧪 Iniciando pruebas del sistema de órdenes..."

# 1. Crear una orden de prueba
echo "1️⃣ Creando orden de prueba..."
CREATE_ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "673a5299e2f1234567890111",
    "items": [{
      "productId": "netflix-test",
      "name": "Netflix Test",
      "quantity": 1,
      "price": 17.00,
      "duration": "1 mes",
      "profiles": 1
    }],
    "total": 17.00,
    "paymentMethod": "yape",
    "type_plan_id": 1,
    "promo_code": ""
  }')

echo "Respuesta de creación de orden:"
echo "$CREATE_ORDER_RESPONSE" | jq '.'

# Extraer el ID de la orden creada
ORDER_ID=$(echo "$CREATE_ORDER_RESPONSE" | jq -r '.data._id // .data.id // empty')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo "❌ No se pudo crear la orden"
    exit 1
fi

echo "✅ Orden creada con ID: $ORDER_ID"

# 2. Obtener la orden por ID
echo "2️⃣ Obteniendo orden por ID..."
curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" | jq '.'

# 3. Actualizar estado de la orden
echo "3️⃣ Actualizando estado de la orden..."
curl -s -X PUT "$BASE_URL/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "pagado"}' | jq '.'

# 4. Obtener historial de órdenes del cliente
echo "4️⃣ Obteniendo historial de órdenes..."
curl -s -X GET "$BASE_URL/api/orders/customer/$CUSTOMER_ID/history" | jq '.'

# 5. Obtener estadísticas de órdenes
echo "5️⃣ Obteniendo estadísticas de órdenes..."
curl -s -X GET "$BASE_URL/api/orders/customer/$CUSTOMER_ID/statistics" | jq '.'

# 6. Obtener tipos de servicios del usuario
echo "6️⃣ Obteniendo tipos de servicios..."
curl -s -X GET "$BASE_URL/api/orders/customer/$CUSTOMER_ID/service-types" | jq '.'

# 7. Probar API de historial con customer-auth
echo "7️⃣ Probando API de historial con customer-auth..."
curl -s -X POST "$BASE_URL/api/customer-auth/order-history" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "'$CUSTOMER_ID'",
    "page": 1,
    "limit": 10,
    "language": "es"
  }' | jq '.'

echo "✅ Pruebas completadas"
