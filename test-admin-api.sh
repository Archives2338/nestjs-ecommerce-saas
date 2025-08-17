#!/bin/bash

echo "🔧 Probando la API de autenticación administrativa..."

BASE_URL="http://localhost:3000"

echo ""
echo "📋 1. Probando login de administrador..."
curl -X POST "$BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }' | jq '.'

echo ""
echo "📋 2. Probando login con credenciales incorrectas..."
curl -X POST "$BASE_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrong_password"
  }' | jq '.'

echo ""
echo "📋 3. Probando obtener contenido sin autenticación..."
curl -X GET "$BASE_URL/api/admin/content" | jq '.'

echo ""
echo "🎯 Si el servidor está corriendo, deberías ver las respuestas de la API arriba."
echo "💡 Para probar con token válido, primero haz login y usa el access_token devuelto."
