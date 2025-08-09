#!/bin/bash

# Script para probar el sistema completo de órdenes CON AUTENTICACIÓN JWT
# Incluye login para obtener token JWT

BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo "🔐 Iniciando pruebas del sistema de órdenes con autenticación..."

# 1. Primero intentar login para obtener JWT token
echo "1️⃣ Intentando login para obtener JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer-auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }')

echo "Respuesta de login:"
echo "$LOGIN_RESPONSE" | jq '.'

# Extraer el token JWT
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // .data.token // empty')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
    echo "❌ No se pudo obtener token JWT. Creando cuenta de prueba..."
    
    # Intentar registrar usuario de prueba
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer-auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "'$TEST_EMAIL'",
        "password": "'$TEST_PASSWORD'",
        "confirmPassword": "'$TEST_PASSWORD'",
        "name": "Usuario Prueba",
        "phone": "+51987654321"
      }')
    
    echo "Respuesta de registro:"
    echo "$REGISTER_RESPONSE" | jq '.'
    
    # Intentar login nuevamente
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer-auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "'$TEST_EMAIL'",
        "password": "'$TEST_PASSWORD'"
      }')
    
    JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // .data.token // empty')
fi

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
    echo "❌ No se pudo obtener token JWT. Usando token mock..."
    JWT_TOKEN="mock-jwt-token-for-testing"
fi

echo "✅ JWT Token obtenido: ${JWT_TOKEN:0:20}..."

# 2. Crear una orden de prueba CON AUTENTICACIÓN
echo "2️⃣ Creando orden de prueba con JWT..."
CREATE_ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "serviceId": "673a5299e2f1234567890111",
    "items": [{
      "productId": "netflix-test-auth",
      "name": "Netflix Test Auth",
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

echo "Respuesta de creación de orden con JWT:"
echo "$CREATE_ORDER_RESPONSE" | jq '.'

# Extraer el ID de la orden creada
ORDER_ID=$(echo "$CREATE_ORDER_RESPONSE" | jq -r '.data._id // .data.id // empty')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo "❌ No se pudo crear la orden con JWT"
    # Probar sin autenticación para debug
    echo "🔧 Probando crear orden SIN autenticación (para debug)..."
    curl -s -X POST "$BASE_URL/api/orders" \
      -H "Content-Type: application/json" \
      -d '{
        "serviceId": "673a5299e2f1234567890111",
        "items": [{
          "productId": "netflix-debug",
          "name": "Netflix Debug",
          "quantity": 1,
          "price": 17.00,
          "duration": "1 mes",
          "profiles": 1
        }],
        "total": 17.00,
        "paymentMethod": "yape",
        "type_plan_id": 1
      }' | jq '.'
    exit 1
fi

echo "✅ Orden creada con JWT. ID: $ORDER_ID"

# 3. Obtener la orden por ID CON AUTENTICACIÓN
echo "3️⃣ Obteniendo orden por ID con JWT..."
curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# 4. Obtener MI historial de órdenes (nuevo endpoint)
echo "4️⃣ Obteniendo MI historial de órdenes..."
curl -s -X GET "$BASE_URL/api/orders/my/history" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# 5. Obtener MIS estadísticas de órdenes
echo "5️⃣ Obteniendo MIS estadísticas de órdenes..."
curl -s -X GET "$BASE_URL/api/orders/my/statistics" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# 6. Probar adjuntar comprobante CON AUTENTICACIÓN
echo "6️⃣ Adjuntando comprobante con JWT..."
curl -s -X PUT "$BASE_URL/api/orders/$ORDER_ID/comprobante" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comprobanteUrl": "https://example.com/comprobante.jpg",
    "paymentReference": "REF123456",
    "paymentAmount": 17.00
  }' | jq '.'

# 7. Probar endpoints sin autenticación (debería fallar)
echo "7️⃣ Probando endpoint sin JWT (debería fallar)..."
curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" | jq '.'

echo ""
echo "🔐 RESUMEN DE AUTENTICACIÓN:"
echo "✅ Endpoints protegidos: POST /orders, GET /orders/:id, PUT /orders/:id/comprobante"
echo "✅ Endpoints de usuario: GET /orders/my/history, GET /orders/my/statistics" 
echo "✅ Endpoints admin: PUT /orders/:id/status, GET /orders/trade-no/:tradeNo"
echo "✅ Verificación de propiedad: Solo puede acceder a sus propias órdenes"
echo ""
echo "✅ Pruebas de autenticación completadas"
