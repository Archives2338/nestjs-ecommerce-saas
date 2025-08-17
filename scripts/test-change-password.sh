#!/bin/bash

# 🔐 Script de prueba para el API de cambio de contraseña
# Uso: ./test-change-password.sh

echo "🚀 Iniciando pruebas del API de cambio de contraseña..."

# Configuración
BASE_URL="http://localhost:3000/api/customer/auth"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"
NEW_PASSWORD="newpassword456"

echo ""
echo "📧 Configuración de prueba:"
echo "   Email: $TEST_EMAIL"
echo "   Contraseña actual: $TEST_PASSWORD"
echo "   Nueva contraseña: $NEW_PASSWORD"
echo ""

# Función para hacer requests con formato bonito
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local token="$4"
    
    echo "📤 $method $endpoint"
    if [ -n "$token" ]; then
        echo "🔑 Token: ${token:0:20}..."
    fi
    
    if [ -n "$data" ]; then
        echo "📄 Data: $data"
    fi
    
    local headers="Content-Type: application/json"
    if [ -n "$token" ]; then
        headers="$headers,Authorization: Bearer $token"
    fi
    
    echo "⏳ Enviando request..."
    local response=$(curl -s -X "$method" \
        -H "Content-Type: application/json" \
        $(if [ -n "$token" ]; then echo "-H \"Authorization: Bearer $token\""; fi) \
        $(if [ -n "$data" ]; then echo "-d '$data'"; fi) \
        "$BASE_URL$endpoint")
    
    echo "📥 Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    # Retornar el response para uso posterior
    echo "$response"
}

# 1. Primero hacer login para obtener token
echo "🔐 Paso 1: Login para obtener token..."
login_data='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
}'

login_response=$(make_request "POST" "/login" "$login_data")
token=$(echo "$login_response" | jq -r '.data.token // empty' 2>/dev/null)

if [ -z "$token" ] || [ "$token" = "null" ]; then
    echo "❌ Error: No se pudo obtener token de autenticación"
    echo "💡 Asegúrate de que el usuario existe con email: $TEST_EMAIL"
    echo ""
    echo "🛠️  Para crear un usuario de prueba, ejecuta:"
    echo "   curl -X POST http://localhost:3000/api/customer/auth/register \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"email\":\"$TEST_EMAIL\", \"password\":\"$TEST_PASSWORD\", \"firstName\":\"Test\", \"lastName\":\"User\"}'"
    exit 1
fi

echo "✅ Token obtenido exitosamente"
echo ""

# 2. Probar cambio de contraseña exitoso
echo "🔐 Paso 2: Probando cambio de contraseña exitoso..."
change_data='{
    "currentPassword": "'$TEST_PASSWORD'",
    "newPassword": "'$NEW_PASSWORD'"
}'

change_response=$(make_request "POST" "/change-password" "$change_data" "$token")
change_code=$(echo "$change_response" | jq -r '.code // 999' 2>/dev/null)

if [ "$change_code" = "0" ]; then
    echo "✅ Cambio de contraseña exitoso"
else
    echo "❌ Error en cambio de contraseña"
    echo "🔍 Response: $change_response"
fi
echo ""

# 3. Verificar que la nueva contraseña funciona
echo "🔐 Paso 3: Verificando que la nueva contraseña funciona..."
login_new_data='{
    "email": "'$TEST_EMAIL'",
    "password": "'$NEW_PASSWORD'"
}'

login_new_response=$(make_request "POST" "/login" "$login_new_data")
new_token=$(echo "$login_new_response" | jq -r '.data.token // empty' 2>/dev/null)

if [ -n "$new_token" ] && [ "$new_token" != "null" ]; then
    echo "✅ Login con nueva contraseña exitoso"
else
    echo "❌ Error: No se pudo hacer login con la nueva contraseña"
fi
echo ""

# 4. Probar errores comunes
echo "🧪 Paso 4: Probando casos de error..."

# 4a. Contraseña actual incorrecta
echo "🔍 4a. Probando contraseña actual incorrecta..."
error_data_1='{
    "currentPassword": "wrongpassword",
    "newPassword": "anothernewpassword123"
}'

error_response_1=$(make_request "POST" "/change-password" "$error_data_1" "$new_token")
error_code_1=$(echo "$error_response_1" | jq -r '.code // 999' 2>/dev/null)

if [ "$error_code_1" = "1" ]; then
    echo "✅ Error manejado correctamente (contraseña actual incorrecta)"
else
    echo "❌ Error no manejado correctamente"
fi
echo ""

# 4b. Nueva contraseña muy corta
echo "🔍 4b. Probando nueva contraseña muy corta..."
error_data_2='{
    "currentPassword": "'$NEW_PASSWORD'",
    "newPassword": "123"
}'

error_response_2=$(make_request "POST" "/change-password" "$error_data_2" "$new_token")
error_code_2=$(echo "$error_response_2" | jq -r '.code // 999' 2>/dev/null)

if [ "$error_code_2" = "1" ]; then
    echo "✅ Error manejado correctamente (contraseña muy corta)"
else
    echo "❌ Error no manejado correctamente"
fi
echo ""

# 4c. Misma contraseña
echo "🔍 4c. Probando misma contraseña..."
error_data_3='{
    "currentPassword": "'$NEW_PASSWORD'",
    "newPassword": "'$NEW_PASSWORD'"
}'

error_response_3=$(make_request "POST" "/change-password" "$error_data_3" "$new_token")
error_code_3=$(echo "$error_response_3" | jq -r '.code // 999' 2>/dev/null)

if [ "$error_code_3" = "1" ]; then
    echo "✅ Error manejado correctamente (misma contraseña)"
else
    echo "❌ Error no manejado correctamente"
fi
echo ""

# 4d. Sin token de autorización
echo "🔍 4d. Probando sin token de autorización..."
error_data_4='{
    "currentPassword": "'$NEW_PASSWORD'",
    "newPassword": "finalpassword789"
}'

error_response_4=$(make_request "POST" "/change-password" "$error_data_4" "")
error_code_4=$(echo "$error_response_4" | jq -r '.code // 999' 2>/dev/null)

if [ "$error_code_4" = "1" ] || [ "$error_code_4" = "401" ]; then
    echo "✅ Error manejado correctamente (sin autorización)"
else
    echo "❌ Error no manejado correctamente"
fi
echo ""

# 5. Restaurar contraseña original para futuras pruebas
echo "🔄 Paso 5: Restaurando contraseña original..."
restore_data='{
    "currentPassword": "'$NEW_PASSWORD'",
    "newPassword": "'$TEST_PASSWORD'"
}'

restore_response=$(make_request "POST" "/change-password" "$restore_data" "$new_token")
restore_code=$(echo "$restore_response" | jq -r '.code // 999' 2>/dev/null)

if [ "$restore_code" = "0" ]; then
    echo "✅ Contraseña restaurada exitosamente"
else
    echo "⚠️  Warning: No se pudo restaurar la contraseña original"
fi
echo ""

# Resumen final
echo "📊 RESUMEN DE PRUEBAS:"
echo "===================="
if [ "$change_code" = "0" ]; then
    echo "✅ Cambio de contraseña: PASSED"
else
    echo "❌ Cambio de contraseña: FAILED"
fi

if [ -n "$new_token" ] && [ "$new_token" != "null" ]; then
    echo "✅ Login con nueva contraseña: PASSED"
else
    echo "❌ Login con nueva contraseña: FAILED"
fi

if [ "$error_code_1" = "1" ]; then
    echo "✅ Validación contraseña incorrecta: PASSED"
else
    echo "❌ Validación contraseña incorrecta: FAILED"
fi

if [ "$error_code_2" = "1" ]; then
    echo "✅ Validación contraseña corta: PASSED"
else
    echo "❌ Validación contraseña corta: FAILED"
fi

if [ "$error_code_3" = "1" ]; then
    echo "✅ Validación misma contraseña: PASSED"
else
    echo "❌ Validación misma contraseña: FAILED"
fi

if [ "$error_code_4" = "1" ] || [ "$error_code_4" = "401" ]; then
    echo "✅ Validación sin autorización: PASSED"
else
    echo "❌ Validación sin autorización: FAILED"
fi

echo ""
echo "🎉 Pruebas completadas!"
echo ""
echo "📋 Para uso manual:"
echo "   Endpoint: POST $BASE_URL/change-password"
echo "   Headers: Authorization: Bearer <token>"
echo "   Body: {\"currentPassword\": \"actual\", \"newPassword\": \"nueva\"}"
