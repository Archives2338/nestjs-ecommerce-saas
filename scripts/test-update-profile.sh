#!/bin/bash

# Script para probar el API de actualización de perfil de cliente
# Autor: GitHub Copilot
# Fecha: $(date)

echo "🧪 Iniciando pruebas del API de actualización de perfil de cliente"
echo "======================================================================="

# Variables de configuración
BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/customer/auth"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para hacer login y obtener token
login_customer() {
    local email=$1
    local password=$2
    
    echo -e "${BLUE}🔐 Intentando login con: $email${NC}"
    
    response=$(curl -s -X POST "$API_URL/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\"
        }")
    
    echo "Respuesta del login: $response"
    
    # Extraer token si el login fue exitoso
    token=$(echo $response | jq -r '.data.token // empty')
    if [ ! -z "$token" ] && [ "$token" != "null" ]; then
        echo -e "${GREEN}✅ Login exitoso. Token obtenido.${NC}"
        echo "$token"
    else
        echo -e "${RED}❌ Error en login${NC}"
        echo ""
    fi
}

# Función para probar actualización de perfil
test_update_profile() {
    local token=$1
    local test_name=$2
    local update_data=$3
    local expected_status=$4
    
    echo -e "\n${YELLOW}📝 Prueba: $test_name${NC}"
    echo "Datos: $update_data"
    
    response=$(curl -s -w "%{http_code}" -X PUT "$API_URL/profile" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$update_data")
    
    # Separar respuesta del código HTTP
    http_code="${response: -3}"
    response_body="${response%???}"
    
    echo "Código HTTP: $http_code"
    echo "Respuesta: $response_body"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Código HTTP correcto ($expected_status)${NC}"
    else
        echo -e "${RED}❌ Código HTTP incorrecto. Esperado: $expected_status, Recibido: $http_code${NC}"
    fi
    
    # Verificar estructura de respuesta
    code=$(echo $response_body | jq -r '.code // "null"')
    message=$(echo $response_body | jq -r '.message // "null"')
    
    echo "Code: $code, Message: $message"
    echo "----------------------------------------"
}

# Función principal
main() {
    echo "🚀 Verificando que el servidor esté ejecutándose..."
    
    # Verificar que el servidor esté corriendo
    if ! curl -s "$BASE_URL" > /dev/null; then
        echo -e "${RED}❌ El servidor no está ejecutándose en $BASE_URL${NC}"
        echo "Por favor, ejecuta: npm run start:dev"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Servidor está ejecutándose${NC}"
    
    # Intentar login con cliente de prueba
    echo -e "\n${BLUE}🔑 Obteniendo token de autenticación...${NC}"
    
    # Puedes cambiar estas credenciales por un cliente que exista en tu BD
    TEST_EMAIL="test@meteleplay.com"
    TEST_PASSWORD="password123"
    
    TOKEN=$(login_customer "$TEST_EMAIL" "$TEST_PASSWORD")
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ No se pudo obtener token. Creando cliente de prueba...${NC}"
        
        # Intentar crear cliente de prueba
        register_response=$(curl -s -X POST "$API_URL/register" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"$TEST_EMAIL\",
                \"password\": \"$TEST_PASSWORD\",
                \"firstName\": \"Usuario\",
                \"lastName\": \"Prueba\"
            }")
        
        echo "Respuesta del registro: $register_response"
        
        # Intentar login nuevamente
        TOKEN=$(login_customer "$TEST_EMAIL" "$TEST_PASSWORD")
        
        if [ -z "$TOKEN" ]; then
            echo -e "${RED}❌ No se pudo obtener token después del registro${NC}"
            exit 1
        fi
    fi
    
    echo -e "\n${GREEN}🎯 Iniciando pruebas de actualización de perfil...${NC}"
    
    # Prueba 1: Actualización exitosa de nombres
    test_update_profile "$TOKEN" \
        "Actualización exitosa de nombres" \
        '{"firstName": "Juan Carlos", "lastName": "Pérez López"}' \
        "200"
    
    # Prueba 2: Actualización con teléfono
    test_update_profile "$TOKEN" \
        "Actualización con teléfono válido" \
        '{"firstName": "Juan Carlos", "lastName": "Pérez López", "phone": "+1234567890"}' \
        "200"
    
    # Prueba 3: Actualización con idioma preferido
    test_update_profile "$TOKEN" \
        "Actualización con idioma preferido" \
        '{"firstName": "Juan Carlos", "preferredLanguage": "es"}' \
        "200"
    
    # Prueba 4: Actualización con moneda preferida
    test_update_profile "$TOKEN" \
        "Actualización con moneda preferida" \
        '{"firstName": "Juan Carlos", "preferredCurrency": "USD"}' \
        "200"
    
    # Prueba 5: Teléfono inválido
    test_update_profile "$TOKEN" \
        "Teléfono inválido" \
        '{"firstName": "Juan", "phone": "123"}' \
        "400"
    
    # Prueba 6: Nombres vacíos
    test_update_profile "$TOKEN" \
        "Nombres vacíos" \
        '{"firstName": "", "lastName": ""}' \
        "400"
    
    # Prueba 7: Sin token de autenticación
    test_update_profile "" \
        "Sin token de autenticación" \
        '{"firstName": "Test", "lastName": "User"}' \
        "401"
    
    # Prueba 8: Token inválido
    test_update_profile "invalid-token" \
        "Token inválido" \
        '{"firstName": "Test", "lastName": "User"}' \
        "401"
    
    echo -e "\n${GREEN}🎉 Pruebas completadas!${NC}"
    echo "======================================================================="
}

# Verificar dependencias
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq no está instalado. Instálalo con: brew install jq${NC}"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl no está instalado${NC}"
    exit 1
fi

# Ejecutar pruebas
main
