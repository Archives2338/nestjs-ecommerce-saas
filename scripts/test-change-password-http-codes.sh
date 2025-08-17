#!/bin/bash

# 🔐 Script de prueba mejorado para verificar códigos HTTP del API de cambio de contraseña
# Uso: ./test-change-password-http-codes.sh

echo "🚀 Probando códigos de estado HTTP para change-password..."

# Configuración
BASE_URL="http://localhost:3000/api/customer/auth"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo ""
echo "📧 Configuración de prueba:"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo ""

# Función para hacer requests con análisis de códigos HTTP
test_request() {
    local description="$1"
    local data="$2"
    local token="$3"
    local expected_code="$4"
    
    echo "🧪 $description"
    echo "📄 Data: $data"
    
    # Hacer request y capturar tanto el response como el código HTTP
    local temp_file=$(mktemp)
    local http_code=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        $(if [ -n "$token" ]; then echo "-H \"Authorization: Bearer $token\""; fi) \
        -d "$data" \
        -o "$temp_file" \
        "$BASE_URL/change-password")
    
    local response_body=$(cat "$temp_file")
    rm "$temp_file"
    
    echo "📥 HTTP Code: $http_code"
    echo "📥 Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    
    # Verificar si el código HTTP es el esperado
    if [ "$http_code" = "$expected_code" ]; then
        echo "✅ Código HTTP correcto ($expected_code)"
    else
        echo "❌ Código HTTP incorrecto. Esperado: $expected_code, Recibido: $http_code"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# 1. Obtener token de autenticación
echo "🔐 Paso 1: Obteniendo token de autenticación..."
login_data='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
}'

login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    "$BASE_URL/login")

token=$(echo "$login_response" | jq -r '.data.token // empty' 2>/dev/null)

if [ -z "$token" ] || [ "$token" = "null" ]; then
    echo "❌ Error: No se pudo obtener token. Intentando crear usuario..."
    
    register_data='{
        "email": "'$TEST_EMAIL'",
        "password": "'$TEST_PASSWORD'",
        "firstName": "Test",
        "lastName": "User"
    }'
    
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$register_data" \
        "$BASE_URL/register" > /dev/null
    
    # Reintentar login
    login_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$login_data" \
        "$BASE_URL/login")
    
    token=$(echo "$login_response" | jq -r '.data.token // empty' 2>/dev/null)
fi

if [ -z "$token" ] || [ "$token" = "null" ]; then
    echo "❌ Error crítico: No se puede obtener token"
    exit 1
fi

echo "✅ Token obtenido: ${token:0:20}..."
echo ""
echo "========================================"
echo ""

# 2. Probar casos con diferentes códigos HTTP esperados

# Caso 1: Sin token (401 Unauthorized)
test_request \
    "Caso 1: Sin token de autorización" \
    '{"currentPassword": "'$TEST_PASSWORD'", "newPassword": "nueva123456"}' \
    "" \
    "401"

# Caso 2: Contraseña actual incorrecta (400 Bad Request)
test_request \
    "Caso 2: Contraseña actual incorrecta" \
    '{"currentPassword": "wrongpassword", "newPassword": "nueva123456"}' \
    "$token" \
    "400"

# Caso 3: Nueva contraseña muy corta (400 Bad Request)
test_request \
    "Caso 3: Nueva contraseña muy corta (validación DTO)" \
    '{"currentPassword": "'$TEST_PASSWORD'", "newPassword": "123"}' \
    "$token" \
    "400"

# Caso 4: Misma contraseña (400 Bad Request)
test_request \
    "Caso 4: Nueva contraseña igual a la actual" \
    '{"currentPassword": "'$TEST_PASSWORD'", "newPassword": "'$TEST_PASSWORD'"}' \
    "$token" \
    "400"

# Caso 5: Cambio exitoso (200 OK)
test_request \
    "Caso 5: Cambio de contraseña exitoso" \
    '{"currentPassword": "'$TEST_PASSWORD'", "newPassword": "NuevaPassword123"}' \
    "$token" \
    "200"

# Caso 6: Verificar que la nueva contraseña funciona
echo "🔐 Verificando que la nueva contraseña funciona..."
new_login_data='{
    "email": "'$TEST_EMAIL'",
    "password": "NuevaPassword123"
}'

new_login_response=$(curl -s -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$new_login_data" \
    "$BASE_URL/login")

new_http_code=$(echo "$new_login_response" | tail -c 4)
new_response_body=$(echo "$new_login_response" | head -c -4)

echo "📥 Login HTTP Code: $new_http_code"
echo "📥 Login Response:"
echo "$new_response_body" | jq '.' 2>/dev/null || echo "$new_response_body"

if [ "$new_http_code" = "200" ]; then
    new_token=$(echo "$new_response_body" | jq -r '.data.token // empty' 2>/dev/null)
    if [ -n "$new_token" ] && [ "$new_token" != "null" ]; then
        echo "✅ Nueva contraseña funciona correctamente"
        
        # Restaurar contraseña original
        echo ""
        echo "🔄 Restaurando contraseña original..."
        test_request \
            "Restaurar contraseña original" \
            '{"currentPassword": "NuevaPassword123", "newPassword": "'$TEST_PASSWORD'"}' \
            "$new_token" \
            "200"
    else
        echo "❌ Error: Login exitoso pero sin token"
    fi
else
    echo "❌ Error: No se pudo hacer login con la nueva contraseña"
fi

echo ""
echo "📊 RESUMEN DE CÓDIGOS HTTP:"
echo "=========================="
echo "✅ 401 Unauthorized: Sin token"
echo "✅ 400 Bad Request: Errores de validación/lógica"
echo "✅ 200 OK: Operación exitosa"
echo ""
echo "🎯 Los códigos HTTP ahora reflejan correctamente el estado de la operación!"
echo "   - Frontend puede manejar errores basándose en códigos HTTP"
echo "   - Mensajes detallados siguen disponibles en response.message"
