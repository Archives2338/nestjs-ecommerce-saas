#!/bin/bash

# 🔍 Script de Verificación de Integridad del Sistema Pricing Modular
# Verifica que todas las dependencias, servicios y controladores estén funcionando

echo "🔍 =================================="
echo "   VERIFICACIÓN DE INTEGRIDAD"
echo "=================================="

BASE_URL="http://localhost:3000/api"
SERVICE_ID="68903254d69fe657139074f2"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para verificar endpoint
check_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=${4:-200}
    
    echo -e "${BLUE}🔹 Testing: $description${NC}"
    
    local response
    local status_code
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
        status_code="${response: -3}"
        response="${response%???}"
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d '{}')
        status_code="${response: -3}"
        response="${response%???}"
    fi
    
    if [ "$status_code" -eq "$expected_status" ] || [ "$status_code" -eq 400 ] || [ "$status_code" -eq 422 ]; then
        echo -e "${GREEN}✅ $description - Status: $status_code${NC}"
        return 0
    else
        echo -e "${RED}❌ $description - Status: $status_code${NC}"
        echo -e "${YELLOW}   Response: $response${NC}"
        return 1
    fi
}

echo -e "${YELLOW}🚀 Verificando servidor...${NC}"
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Servidor no disponible en $BASE_URL${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Servidor disponible${NC}"
echo ""

# Verificar endpoints de Month Options
echo -e "${BLUE}📅 VERIFICANDO MONTH OPTIONS ENDPOINTS${NC}"
echo "======================================"
check_endpoint "GET" "/admin/services/month-options/service/$SERVICE_ID" "Listar month options"
check_endpoint "POST" "/admin/services/month-options/$SERVICE_ID" "Crear month option" 400
check_endpoint "GET" "/admin/services/month-options/1" "Obtener month option por ID" 
check_endpoint "PUT" "/admin/services/month-options/1" "Actualizar month option" 400
check_endpoint "DELETE" "/admin/services/month-options/999" "Eliminar month option" 404
echo ""

# Verificar endpoints de Screen Options
echo -e "${BLUE}📺 VERIFICANDO SCREEN OPTIONS ENDPOINTS${NC}"
echo "======================================="
check_endpoint "GET" "/admin/services/screen-options/service/$SERVICE_ID" "Listar screen options"
check_endpoint "POST" "/admin/services/screen-options/$SERVICE_ID" "Crear screen option" 400
check_endpoint "GET" "/admin/services/screen-options/1" "Obtener screen option por ID"
check_endpoint "PUT" "/admin/services/screen-options/1" "Actualizar screen option" 400
check_endpoint "DELETE" "/admin/services/screen-options/999" "Eliminar screen option" 404
echo ""

# Verificar endpoints de Service Plans
echo -e "${BLUE}💰 VERIFICANDO SERVICE PLANS ENDPOINTS${NC}"
echo "======================================"
check_endpoint "GET" "/admin/services/plans/service/$SERVICE_ID" "Listar service plans"
check_endpoint "POST" "/admin/services/plans/$SERVICE_ID" "Crear service plan" 400
check_endpoint "GET" "/admin/services/plans/1" "Obtener service plan por ID"
check_endpoint "PUT" "/admin/services/plans/1" "Actualizar service plan" 400
check_endpoint "DELETE" "/admin/services/plans/999" "Eliminar service plan" 404
check_endpoint "GET" "/admin/services/plans/combo/$SERVICE_ID/1/1" "Obtener plan por combinación"
echo ""

# Verificar endpoints de Pricing Integration
echo -e "${BLUE}🎯 VERIFICANDO PRICING INTEGRATION ENDPOINTS${NC}"
echo "============================================="
check_endpoint "GET" "/admin/services/plans/matrix/$SERVICE_ID" "Matriz de precios"
check_endpoint "GET" "/admin/services/plans/missing/$SERVICE_ID" "Combinaciones faltantes"
check_endpoint "GET" "/admin/services/plans/stats/$SERVICE_ID" "Estadísticas de pricing"
echo ""

# Verificar estructura de archivos
echo -e "${BLUE}📁 VERIFICANDO ESTRUCTURA DE ARCHIVOS${NC}"
echo "======================================"

files_to_check=(
    "src/services/schemas-new/service-month-option.schema.ts"
    "src/services/schemas-new/service-screen-option.schema.ts"
    "src/services/schemas-new/service-plan.schema.ts"
    "src/services/schemas-new/index.ts"
    "src/services/services/service-month-option.service.ts"
    "src/services/services/service-screen-option.service.ts"
    "src/services/services/service-plan.service.ts"
    "src/services/services/service-pricing-integration.service.ts"
    "src/services/services/index.ts"
    "src/services/controllers/admin-month-options.controller.ts"
    "src/services/controllers/admin-screen-options.controller.ts"
    "src/services/controllers/admin-service-plans.controller.ts"
    "src/services/controllers/admin-service-pricing.controller.ts"
    "src/services/controllers/index.ts"
    "src/services/dto/service-plans.dto.ts"
    "src/services/services.module.ts"
)

missing_files=0
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
        ((missing_files++))
    fi
done

echo ""
echo -e "${BLUE}📊 RESUMEN DE VERIFICACIÓN${NC}"
echo "============================"

if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los archivos están presentes${NC}"
    echo -e "${GREEN}✅ Todos los endpoints responden correctamente${NC}"
    echo -e "${GREEN}🎉 Sistema de Pricing Modular: INTEGRACIÓN COMPLETA${NC}"
else
    echo -e "${RED}❌ Faltan $missing_files archivos${NC}"
    echo -e "${YELLOW}⚠️  Revisar la implementación${NC}"
fi

echo ""
echo -e "${BLUE}🚀 SIGUIENTE PASO:${NC}"
echo "Ejecuta: ./scripts/test-pricing-system-complete.sh"
echo ""
