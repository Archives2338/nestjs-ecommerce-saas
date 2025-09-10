#!/bin/bash

# 🚀 Test S3 File Upload API
# Backend NestJS E-commerce

echo "🚀 Probando Sistema de Carga de Archivos S3"
echo "============================================"

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/files"

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
echo -e "${CYAN}📝 Creando archivo de prueba...${NC}"
# Crear un archivo de prueba
TEST_FILE="/tmp/test-upload.txt"
echo "Este es un archivo de prueba para S3
Fecha: $(date)
Servidor: $BASE_URL
Bucket: mybucketimperio" > "$TEST_FILE"

echo -e "${GREEN}✅ Archivo de prueba creado: $TEST_FILE${NC}"

echo ""
echo -e "${CYAN}1. 📤 Probando subida de archivo único${NC}"
echo "POST $API_URL/upload"

UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/upload" \
  -F "file=@$TEST_FILE" \
  -F "folder=test-uploads")

echo "$UPLOAD_RESPONSE" | jq '.'

# Extraer información del archivo subido
FILE_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.url // empty')
FILE_KEY=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.key // empty')

if [ ! -z "$FILE_URL" ]; then
    echo -e "${GREEN}✅ Archivo subido exitosamente${NC}"
    echo -e "${YELLOW}📍 URL: $FILE_URL${NC}"
    echo -e "${YELLOW}🔑 Key: $FILE_KEY${NC}"
else
    echo -e "${RED}❌ Error subiendo archivo${NC}"
fi

echo ""
echo -e "${CYAN}2. 🔗 Probando generación de URL firmada${NC}"
if [ ! -z "$FILE_KEY" ]; then
    echo "GET $API_URL/signed-url/$FILE_KEY"
    
    SIGNED_URL_RESPONSE=$(curl -s -X GET "$API_URL/signed-url/$FILE_KEY?expires=1800")
    echo "$SIGNED_URL_RESPONSE" | jq '.'
    
    SIGNED_URL=$(echo "$SIGNED_URL_RESPONSE" | jq -r '.data.signedUrl // empty')
    if [ ! -z "$SIGNED_URL" ]; then
        echo -e "${GREEN}✅ URL firmada generada exitosamente${NC}"
        echo -e "${YELLOW}🔗 URL firmada: ${SIGNED_URL:0:80}...${NC}"
    else
        echo -e "${RED}❌ Error generando URL firmada${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Saltando test de URL firmada (no hay archivo subido)${NC}"
fi

echo ""
echo -e "${CYAN}3. 🖼️ Probando subida de avatar (imagen)${NC}"
# Crear una imagen simple en base64 (1x1 pixel PNG transparente)
TINY_PNG_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
AVATAR_FILE="/tmp/test-avatar.png"
echo "$TINY_PNG_BASE64" | base64 --decode > "$AVATAR_FILE"

echo "POST $API_URL/upload-avatar"

AVATAR_RESPONSE=$(curl -s -X POST "$API_URL/upload-avatar" \
  -F "avatar=@$AVATAR_FILE")

echo "$AVATAR_RESPONSE" | jq '.'

AVATAR_URL=$(echo "$AVATAR_RESPONSE" | jq -r '.data.avatarUrl // empty')
AVATAR_KEY=$(echo "$AVATAR_RESPONSE" | jq -r '.data.key // empty')

if [ ! -z "$AVATAR_URL" ]; then
    echo -e "${GREEN}✅ Avatar subido exitosamente${NC}"
    echo -e "${YELLOW}📍 Avatar URL: $AVATAR_URL${NC}"
else
    echo -e "${RED}❌ Error subiendo avatar${NC}"
fi

echo ""
echo -e "${CYAN}4. 🗑️ Probando eliminación de archivo${NC}"
if [ ! -z "$FILE_KEY" ]; then
    echo "DELETE $API_URL/$FILE_KEY"
    
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/$FILE_KEY")
    echo "$DELETE_RESPONSE" | jq '.'
    
    DELETE_SUCCESS=$(echo "$DELETE_RESPONSE" | jq -r '.code // 1')
    if [ "$DELETE_SUCCESS" = "0" ]; then
        echo -e "${GREEN}✅ Archivo eliminado exitosamente${NC}"
    else
        echo -e "${RED}❌ Error eliminando archivo${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Saltando test de eliminación (no hay archivo para eliminar)${NC}"
fi

echo ""
echo -e "${CYAN}5. 📦 Probando subida múltiple${NC}"
# Crear múltiples archivos de prueba
TEST_FILE_2="/tmp/test-upload-2.txt"
TEST_FILE_3="/tmp/test-upload-3.txt"

echo "Archivo de prueba #2 - $(date)" > "$TEST_FILE_2"
echo "Archivo de prueba #3 - $(date)" > "$TEST_FILE_3"

echo "POST $API_URL/upload-multiple"

MULTIPLE_RESPONSE=$(curl -s -X POST "$API_URL/upload-multiple" \
  -F "files=@$TEST_FILE_2" \
  -F "files=@$TEST_FILE_3" \
  -F "folder=multiple-test")

echo "$MULTIPLE_RESPONSE" | jq '.'

MULTIPLE_SUCCESS=$(echo "$MULTIPLE_RESPONSE" | jq -r '.data.success // false')
if [ "$MULTIPLE_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Archivos múltiples subidos exitosamente${NC}"
    SUCCESS_COUNT=$(echo "$MULTIPLE_RESPONSE" | jq -r '.data.successCount // 0')
    echo -e "${YELLOW}📊 Archivos exitosos: $SUCCESS_COUNT${NC}"
else
    echo -e "${RED}❌ Error subiendo archivos múltiples${NC}"
fi

# Limpiar archivos temporales
echo ""
echo -e "${CYAN}🧹 Limpiando archivos temporales...${NC}"
rm -f "$TEST_FILE" "$TEST_FILE_2" "$TEST_FILE_3" "$AVATAR_FILE"
echo -e "${GREEN}✅ Archivos temporales eliminados${NC}"

echo ""
echo -e "${CYAN}🎉 Pruebas de S3 completadas${NC}"
echo -e "${YELLOW}💡 Revisa tu bucket S3 'mybucketimperio' para ver los archivos subidos${NC}"
echo -e "${YELLOW}🔧 Los archivos están organizados en carpetas: test-uploads/, avatars/, multiple-test/${NC}"
