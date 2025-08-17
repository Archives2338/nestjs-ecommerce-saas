#!/bin/bash

# 🔐 Script de debugging para el API de cambio de contraseña
# Uso: ./debug-change-password.sh

echo "🔍 Debugging del endpoint change-password..."

# Configuración
BASE_URL="http://localhost:3000/api/customer/auth"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo ""
echo "📧 Configuración de prueba:"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo ""

# 1. Hacer login para obtener token
echo "🔐 Paso 1: Login para obtener token..."
login_data='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
}'

echo "📤 POST $BASE_URL/login"
echo "📄 Data: $login_data"

login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    "$BASE_URL/login")

echo "📥 Response:"
echo "$login_response" | jq '.' 2>/dev/null || echo "$login_response"

# Extraer token
token=$(echo "$login_response" | jq -r '.data.token // empty' 2>/dev/null)

if [ -z "$token" ] || [ "$token" = "null" ]; then
    echo ""
    echo "❌ Error: No se pudo obtener token"
    echo "🔍 Verificando si el usuario existe..."
    
    # Intentar crear el usuario primero
    echo ""
    echo "🛠️  Intentando crear usuario de prueba..."
    register_data='{
        "email": "'$TEST_EMAIL'",
        "password": "'$TEST_PASSWORD'",
        "firstName": "Test",
        "lastName": "User"
    }'
    
    register_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$register_data" \
        "$BASE_URL/register")
    
    echo "📥 Register Response:"
    echo "$register_response" | jq '.' 2>/dev/null || echo "$register_response"
    
    # Intentar login de nuevo
    echo ""
    echo "🔐 Reintentando login..."
    login_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$login_data" \
        "$BASE_URL/login")
    
    token=$(echo "$login_response" | jq -r '.data.token // empty' 2>/dev/null)
fi

if [ -z "$token" ] || [ "$token" = "null" ]; then
    echo "❌ Error crítico: No se puede obtener token de autenticación"
    exit 1
fi

echo ""
echo "✅ Token obtenido exitosamente:"
echo "🔑 Token: ${token:0:50}..."
echo ""

# 2. Probar cambio de contraseña con debugging detallado
echo "🔐 Paso 2: Probando cambio de contraseña..."
change_data='{
    "currentPassword": "'$TEST_PASSWORD'",
    "newPassword": "newpassword456"
}'

echo "📤 POST $BASE_URL/change-password"
echo "🔑 Authorization: Bearer ${token:0:20}..."
echo "📄 Data: $change_data"

# Hacer request con verbose para ver headers
echo ""
echo "⏳ Enviando request con debugging detallado..."

change_response=$(curl -s -w "\n%{http_code}\n" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "$change_data" \
    "$BASE_URL/change-password")

# Separar response body del status code
response_body=$(echo "$change_response" | head -n -1)
status_code=$(echo "$change_response" | tail -n 1)

echo ""
echo "📥 HTTP Status Code: $status_code"
echo "📥 Response Body:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"

# Analizar el resultado
echo ""
echo "🔍 ANÁLISIS DEL RESULTADO:"
echo "========================"

if [ "$status_code" = "401" ]; then
    echo "❌ Error 401 - Unauthorized"
    echo "🔍 Posibles causas:"
    echo "   - Token inválido o expirado"
    echo "   - Guard CustomerJwtAuthGuard no configurado correctamente"
    echo "   - Estrategia CustomerJwtStrategy no registrada"
    echo "   - Headers de Authorization incorrectos"
    echo ""
    
    # Verificar el token decodificado
    echo "🔍 Verificando contenido del token..."
    token_payload=$(echo "$token" | cut -d. -f2)
    # Agregar padding si es necesario para base64
    while [ $((${#token_payload} % 4)) -ne 0 ]; do
        token_payload="${token_payload}="
    done
    
    decoded_payload=$(echo "$token_payload" | base64 -d 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "📄 Token payload:"
        echo "$decoded_payload" | jq '.' 2>/dev/null || echo "$decoded_payload"
    else
        echo "⚠️  No se pudo decodificar el token payload"
    fi
    
elif [ "$status_code" = "200" ]; then
    echo "✅ Éxito - Status 200"
    response_code=$(echo "$response_body" | jq -r '.code // "unknown"' 2>/dev/null)
    if [ "$response_code" = "0" ]; then
        echo "✅ Cambio de contraseña exitoso"
    else
        echo "⚠️  Request exitoso pero con error en la respuesta"
        echo "🔍 Código de respuesta: $response_code"
    fi
else
    echo "⚠️  Status code inesperado: $status_code"
fi

echo ""
echo "🛠️  DEBUGGING ADICIONAL:"
echo "========================"

# Verificar si el servidor está ejecutándose
echo "🔍 Verificando conectividad al servidor..."
server_check=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/../health" 2>/dev/null || echo "000")
if [ "$server_check" = "000" ]; then
    echo "❌ No se puede conectar al servidor en $BASE_URL"
    echo "💡 Asegúrate de que el servidor NestJS esté ejecutándose en puerto 3000"
else
    echo "✅ Servidor responde (HTTP $server_check)"
fi

# Verificar endpoints disponibles
echo ""
echo "🔍 Verificando endpoints de customer auth..."
endpoints_check=$(curl -s "$BASE_URL/../" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Endpoints de customer auth accesibles"
else
    echo "⚠️  No se pueden verificar los endpoints"
fi

echo ""
echo "📋 RESUMEN PARA DEBUGGING:"
echo "========================="
echo "1. Token obtenido: $([ -n "$token" ] && echo "✅ Sí" || echo "❌ No")"
echo "2. Status HTTP: $status_code"
echo "3. Servidor accesible: $([ "$server_check" != "000" ] && echo "✅ Sí" || echo "❌ No")"
echo ""

if [ "$status_code" = "401" ]; then
    echo "🔧 PASOS PARA SOLUCIONAR ERROR 401:"
    echo "1. Verificar que CustomerJwtStrategy esté registrada en customer-auth.module.ts"
    echo "2. Verificar que CustomerJwtAuthGuard esté importado correctamente"
    echo "3. Verificar que el token JWT tenga el tipo 'customer'"
    echo "4. Verificar que el JWT_SECRET sea el mismo en todas las configuraciones"
    echo "5. Revisar logs del servidor para más detalles"
fi
