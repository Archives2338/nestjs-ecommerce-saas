#!/bin/bash

# 🎯 Test API Admin - Crear Servicio con Ícono S3
# Backend NestJS E-commerce

echo "🚀 Probando Creación de Servicio con Ícono S3"
echo "============================================="

BASE_URL="http://localhost:3000"
ADMIN_URL="$BASE_URL/api/admin"

# Colores para output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🔍 Verificando que el servidor esté corriendo...${NC}"
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Servidor está corriendo en $BASE_URL${NC}"
else
    echo -e "${RED}❌ Servidor no está corriendo. Ejecuta: npm run start:dev${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}🔐 Obteniendo token de administrador...${NC}"
# Login como admin (ajusta las credenciales según tu sistema)
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$ADMIN_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "Admin login response:"
echo "$ADMIN_LOGIN_RESPONSE" | jq '.'

# Extraer token (ajusta según la estructura de tu respuesta)
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.data.token // .token // empty')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo -e "${YELLOW}⚠️ No se pudo obtener token de admin. Continuando sin autenticación...${NC}"
    AUTH_HEADER=""
else
    echo -e "${GREEN}✅ Token de admin obtenido${NC}"
    AUTH_HEADER="Authorization: Bearer $ADMIN_TOKEN"
fi

echo ""
echo -e "${CYAN}🖼️ Creando imagen de prueba para ícono...${NC}"
# Crear una imagen simple en base64 (1x1 pixel PNG transparente)
ICON_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
ICON_FILE="/tmp/service-icon.png"
echo "$ICON_BASE64" | base64 --decode > "$ICON_FILE"

echo -e "${GREEN}✅ Imagen de ícono creada: $ICON_FILE${NC}"

echo ""
echo -e "${CYAN}1. 🏗️ Creando servicio con ícono${NC}"
echo "POST $ADMIN_URL/services"

# Crear servicio con ícono
SERVICE_RESPONSE=$(curl -s -X POST "$ADMIN_URL/services" \
  -H "$AUTH_HEADER" \
  -F 'icon=@'$ICON_FILE \
  -F 'name=Netflix Premium' \
  -F 'subtitle=Streaming de películas y series' \
  -F 'content=Acceso completo a Netflix con todas las funciones premium' \
  -F 'type=1' \
  -F 'url=' \
  -F 'privacy_url=' \
  -F 'term_url=' \
  -F 'refund_url=' \
  -F 'promotion_url=' \
  -F 'plan={"month":[],"screen":[],"default_month_id":null,"default_screen_id":null}' \
  -F 'repayment={"month":[],"screen":[],"default_month_id":null,"default_screen_id":null}' \
  -F 'sort=1' \
  -F 'active=true')

echo "$SERVICE_RESPONSE" | jq '.'

SERVICE_SUCCESS=$(echo "$SERVICE_RESPONSE" | jq -r '.code // 1')
if [ "$SERVICE_SUCCESS" = "0" ]; then
    echo -e "${GREEN}✅ Servicio creado exitosamente${NC}"
    SERVICE_ICON_URL=$(echo "$SERVICE_RESPONSE" | jq -r '.data.icon // empty')
    if [ ! -z "$SERVICE_ICON_URL" ]; then
        echo -e "${YELLOW}🔗 URL del ícono en S3: $SERVICE_ICON_URL${NC}"
    fi
else
    echo -e "${RED}❌ Error creando servicio${NC}"
fi

echo ""
echo -e "${CYAN}2. 📝 Probando actualización de servicio con nuevo ícono${NC}"

# Crear otro ícono diferente para la actualización
ICON_FILE_2="/tmp/service-icon-updated.png"
# Crear una imagen diferente (solo cambiar un byte)
ICON_BASE64_2="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
echo "$ICON_BASE64_2" | base64 --decode > "$ICON_FILE_2"

# Obtener ID del servicio creado (si existe)
SERVICE_ID=$(echo "$SERVICE_RESPONSE" | jq -r '.data._id // .data.id // empty')

if [ ! -z "$SERVICE_ID" ] && [ "$SERVICE_ID" != "null" ]; then
    echo "PUT $ADMIN_URL/services/$SERVICE_ID"
    
    UPDATE_RESPONSE=$(curl -s -X PUT "$ADMIN_URL/services/$SERVICE_ID" \
      -H "$AUTH_HEADER" \
      -F 'icon=@'$ICON_FILE_2 \
      -F 'name=Netflix Premium Updated' \
      -F 'subtitle=Streaming actualizado')

    echo "$UPDATE_RESPONSE" | jq '.'

    UPDATE_SUCCESS=$(echo "$UPDATE_RESPONSE" | jq -r '.code // 1')
    if [ "$UPDATE_SUCCESS" = "0" ]; then
        echo -e "${GREEN}✅ Servicio actualizado exitosamente${NC}"
        UPDATED_ICON_URL=$(echo "$UPDATE_RESPONSE" | jq -r '.data.icon // empty')
        if [ ! -z "$UPDATED_ICON_URL" ]; then
            echo -e "${YELLOW}🔗 Nueva URL del ícono: $UPDATED_ICON_URL${NC}"
        fi
    else
        echo -e "${RED}❌ Error actualizando servicio${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No se pudo obtener ID del servicio. Saltando actualización...${NC}"
fi

echo ""
echo -e "${CYAN}3. 📋 Listando servicios para verificar${NC}"
echo "GET $ADMIN_URL/services"

LIST_RESPONSE=$(curl -s -X GET "$ADMIN_URL/services?limit=5" \
  -H "$AUTH_HEADER")

echo "$LIST_RESPONSE" | jq '.data.services[:2] // .data[:2] // .[:2]'

echo ""
echo -e "${CYAN}🧹 Limpiando archivos temporales...${NC}"
rm -f "$ICON_FILE" "$ICON_FILE_2"
echo -e "${GREEN}✅ Archivos temporales eliminados${NC}"

echo ""
echo -e "${CYAN}🎉 Pruebas completadas${NC}"
echo -e "${YELLOW}💡 Revisa tu bucket S3 'mybucketimperio/service-icons/' para ver los íconos subidos${NC}"
echo -e "${YELLOW}🔧 Los íconos ahora se suben automáticamente a S3 al crear/actualizar servicios${NC}

echo ""
echo -e "${GREEN}📖 CÓMO USAR:${NC}"
echo -e "${CYAN}Crear servicio:${NC}"
echo "curl -X POST '$ADMIN_URL/services' \\"
echo "  -H 'Authorization: Bearer \$TOKEN' \\"
echo "  -F 'icon=@imagen.png' \\"
echo "  -F 'name=Mi Servicio' \\"
echo "  -F 'subtitle=Descripción' \\"
echo "  -F 'content=Contenido detallado' \\"
echo "  -F 'type=1' \\"
echo "  -F 'active=true'"

echo ""
echo -e "${CYAN}Actualizar servicio:${NC}"
echo "curl -X PUT '$ADMIN_URL/services/SERVICE_ID' \\"
echo "  -H 'Authorization: Bearer \$TOKEN' \\"
echo "  -F 'icon=@nuevo-icono.png' \\"
echo "  -F 'name=Nuevo Nombre'"
