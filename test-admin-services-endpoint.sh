#!/bin/bash

# Script para probar el endpoint de administración de servicios
echo "🔧 Probando endpoint de administración de servicios..."
echo "=================================================="

BASE_URL="http://localhost:3000/api/admin/services"

echo ""
echo "📊 1. Obteniendo estadísticas de servicios..."
curl -X GET "${BASE_URL}/stats?language=es" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Respuesta recibida"

echo ""
echo "📋 2. Obteniendo lista de servicios..."
curl -X GET "${BASE_URL}?language=es&page=1&limit=10" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Respuesta recibida"

echo ""
echo "✅ 3. Obteniendo solo servicios activos..."
curl -X GET "${BASE_URL}?language=es&active=true" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Respuesta recibida"

echo ""
echo "🎉 Pruebas completadas!"
