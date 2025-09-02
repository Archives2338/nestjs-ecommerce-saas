#!/bin/bash

# 🔐 Generador de Token Admin Temporal para Testing
# Genera un token de admin para usar en las pruebas de la API

echo "🔐 =================================="
echo "   GENERADOR TOKEN ADMIN TEMPORAL"
echo "=================================="

BASE_URL="http://localhost:3000/api"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Verificando servidor...${NC}"
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Error: El servidor NestJS no está corriendo${NC}"
    echo -e "${YELLOW}   Ejecuta: npm run start:dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Servidor disponible${NC}"
echo ""

# Credenciales de admin por defecto (ajustar según tu configuración)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password"

echo -e "${BLUE}� Username admin: $ADMIN_USERNAME${NC}"
echo -e "${BLUE}🔑 Password: $ADMIN_PASSWORD${NC}"
echo ""

echo -e "${YELLOW}🔐 Autenticando admin...${NC}"

# Intentar login con admin
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$ADMIN_USERNAME\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo -e "${BLUE}Respuesta del login:${NC}"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extraer token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // .access_token // .token // empty' 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Token obtenido exitosamente${NC}"
    echo ""
    echo -e "${CYAN}🎯 TOKEN ADMIN:${NC}"
    echo -e "${YELLOW}$TOKEN${NC}"
    echo ""
    
    # Guardar token en archivo temporal
    echo "$TOKEN" > .admin-token.tmp
    echo -e "${BLUE}💾 Token guardado en: .admin-token.tmp${NC}"
    echo ""
    
    # Mostrar cómo usar el token
    echo -e "${CYAN}📋 CÓMO USAR EL TOKEN:${NC}"
    echo ""
    echo -e "${YELLOW}1. En curl:${NC}"
    echo "   curl -H \"Authorization: Bearer $TOKEN\" \\"
    echo "        \"$BASE_URL/admin/services/month-options/service/68903254d69fe657139074f2\""
    echo ""
    
    echo -e "${YELLOW}2. En scripts de testing:${NC}"
    echo "   Exporta como variable de entorno:"
    echo "   export ADMIN_TOKEN=\"$TOKEN\""
    echo ""
    
    echo -e "${YELLOW}3. En Postman/Insomnia:${NC}"
    echo "   Header: Authorization"
    echo "   Value: Bearer $TOKEN"
    echo ""
    
    # Verificar que el token funcione
    echo -e "${YELLOW}🧪 Verificando token...${NC}"
    TEST_RESPONSE=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/admin/services/month-options/service/68903254d69fe657139074f2")
    
    TEST_STATUS="${TEST_RESPONSE: -3}"
    TEST_BODY="${TEST_RESPONSE%???}"
    
    if [ "$TEST_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Token válido y funcional${NC}"
    else
        echo -e "${YELLOW}⚠️  Token generado, pero verificación devolvió status: $TEST_STATUS${NC}"
        echo -e "${BLUE}   Esto es normal si no hay datos aún${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 ¡Token listo para usar en testing!${NC}"
    
else
    echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
    echo -e "${YELLOW}   Verifica las credenciales de admin o el endpoint de login${NC}"
    echo ""
    echo -e "${BLUE}🔍 Posibles soluciones:${NC}"
    echo "1. Verificar que existe un admin con username: $ADMIN_USERNAME"
    echo "2. Verificar que la contraseña sea correcta: $ADMIN_PASSWORD"
    echo "3. Verificar que el endpoint /admin/auth/login esté funcionando"
    echo "4. Revisar logs del servidor NestJS"
    
    exit 1
fi
