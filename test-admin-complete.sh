#!/bin/bash

# Script de prueba completa para API Admin
echo "🧪 Iniciando pruebas de API Administrativa..."
echo ""

# Variables
BASE_URL="http://localhost:3000/api/admin"
TOKEN=""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
    if [ $2 -eq 200 ] || [ $2 -eq 201 ]; then
        echo -e "${GREEN}✅ $1 - Status: $2${NC}"
    else
        echo -e "${RED}❌ $1 - Status: $2${NC}"
    fi
}

echo -e "${BLUE}📝 1. Login de Administrador${NC}"
echo "============================================"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}')

# Separar respuesta y código de estado
http_code=$(echo "$response" | tail -n1)
json_response=$(echo "$response" | head -n -1)

print_result "Login de admin" $http_code

if [ $http_code -eq 200 ]; then
    TOKEN=$(echo "$json_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "🔑 Token obtenido: ${TOKEN:0:20}..."
    echo ""
    
    echo -e "${BLUE}👤 2. Obtener Perfil${NC}"
    echo "============================================"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/auth/profile" \
      -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    print_result "Obtener perfil" $http_code
    
    if [ $http_code -eq 200 ]; then
        echo "👤 Perfil obtenido:"
        echo "$json_response" | jq '.data | {username, email, role, permissions: (.permissions | length)}'
    else
        echo "❌ Error obteniendo perfil:"
        echo "$json_response"
    fi
    echo ""
    
    echo -e "${BLUE}🔍 3. Verificar Token${NC}"
    echo "============================================"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/auth/verify" \
      -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    print_result "Verificar token" $http_code
    echo "$json_response" | jq '.'
    echo ""
    
    echo -e "${BLUE}📋 4. Obtener Contenido${NC}"
    echo "============================================"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/content" \
      -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    print_result "Obtener contenido" $http_code
    if [ $http_code -eq 200 ]; then
        echo "📝 Contenido disponible:"
        echo "$json_response" | jq '.data | length'
    fi
    echo ""
    
    echo -e "${BLUE}💳 5. Obtener Pagos Pendientes${NC}"
    echo "============================================"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/payments/pending" \
      -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    print_result "Pagos pendientes" $http_code
    if [ $http_code -eq 200 ]; then
        echo "💳 Pagos pendientes encontrados:"
        echo "$json_response" | jq '.data | length'
    fi
    echo ""
    
    echo -e "${BLUE}🚪 6. Logout${NC}"
    echo "============================================"
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/logout" \
      -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    print_result "Logout" $http_code
    echo "$json_response" | jq '.'
    
else
    echo "❌ No se pudo obtener token de acceso"
    echo "$json_response"
fi

echo ""
echo "🏁 Pruebas completadas"
