#!/bin/bash

# 🧪 Test Update Service Price and Description with descripcion_short
# Este script prueba la actualización de precio, descripción y descripcion_short

# Configuración
API_BASE="http://localhost:3000"
LANGUAGE="es"
SERVICE_ID="66e1234567890abcdef12345"  # Cambia por un serviceId real

echo "🧪 Testing Service Price and Description Update with descripcion_short"
echo "=================================================="

# Test 1: Actualizar solo precio y descripción
echo ""
echo "📝 Test 1: Actualizar precio y descripción (sin descripcion_short)"
curl -X PUT "${API_BASE}/index/service/${LANGUAGE}/${SERVICE_ID}/price-description" \
  -H "Content-Type: application/json" \
  -d '{
    "min_price": 19.99,
    "description": [
      "Cuenta premium actualizada",
      "Acceso completo a todas las funciones",
      "Soporte 24/7 incluido"
    ]
  }' | jq '.'

echo ""
echo "⏳ Esperando 2 segundos..."
sleep 2

# Test 2: Actualizar precio, descripción y descripcion_short
echo ""
echo "📝 Test 2: Actualizar precio, descripción y descripcion_short"
curl -X PUT "${API_BASE}/index/service/${LANGUAGE}/${SERVICE_ID}/price-description" \
  -H "Content-Type: application/json" \
  -d '{
    "min_price": 24.99,
    "description": [
      "Cuenta premium completa",
      "Incluye todas las funciones avanzadas",
      "Soporte prioritario",
      "Garantía de satisfacción"
    ],
    "descripcion_short": "Cuenta Premium Completa - 1 Mes"
  }' | jq '.'

echo ""
echo "⏳ Esperando 2 segundos..."
sleep 2

# Test 3: Verificar el resultado obteniendo el catálogo
echo ""
echo "📋 Test 3: Verificar cambios en el catálogo"
curl -X POST "${API_BASE}/index/getTypeClassifyList" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "'${LANGUAGE}'"
  }' | jq '.data.list[0].spuList[] | select(.serviceId == "'${SERVICE_ID}'") | {name: .type_name, min_price: .min_price, description: .description, descripcion_short: .descripcion_short}'

echo ""
echo "✅ Prueba completada!"
echo ""
echo "📌 Notas:"
echo "   - Cambia SERVICE_ID por un ID real de tu base de datos"
echo "   - Verifica que tu API esté corriendo en localhost:3000"
echo "   - Los cambios se reflejarán en el catálogo inmediatamente"