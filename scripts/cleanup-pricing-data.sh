#!/bin/bash

# 🧹 Script de Limpieza de Datos de Testing
# Elimina todos los datos de prueba del sistema de pricing modular

echo "🧹 =================================="
echo "   LIMPIEZA DE DATOS DE TESTING"
echo "=================================="

BASE_URL="http://localhost:3000/api"
SERVICE_ID="68903254d69fe657139074f2"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  Este script eliminará TODOS los datos de pricing del servicio Disney+${NC}"
echo -e "${YELLOW}   Service ID: $SERVICE_ID${NC}"
echo ""
read -p "¿Estás seguro de continuar? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Operación cancelada${NC}"
    exit 0
fi

echo -e "${BLUE}🚀 Iniciando limpieza...${NC}"
echo ""

# Función para hacer DELETE request y mostrar resultado
delete_item() {
    local endpoint=$1
    local description=$2
    local id=$3
    
    echo -e "${YELLOW}🗑️  Eliminando $description (ID: $id)...${NC}"
    
    response=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL$endpoint")
    status_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$status_code" -eq 200 ] || [ "$status_code" -eq 404 ]; then
        echo -e "${GREEN}✅ $description eliminado${NC}"
    else
        echo -e "${RED}❌ Error al eliminar $description - Status: $status_code${NC}"
        echo -e "${YELLOW}   Response: $response_body${NC}"
    fi
}

# 1. Obtener y eliminar todos los Service Plans
echo -e "${BLUE}💰 ELIMINANDO SERVICE PLANS${NC}"
echo "============================"

plans_response=$(curl -s "$BASE_URL/admin/services/plans/service/$SERVICE_ID")
plan_ids=$(echo "$plans_response" | jq -r '.data[].type_plan_id // empty' 2>/dev/null)

if [ -n "$plan_ids" ]; then
    while IFS= read -r plan_id; do
        delete_item "/admin/services/plans/$plan_id" "Service Plan" "$plan_id"
    done <<< "$plan_ids"
else
    echo -e "${YELLOW}ℹ️  No se encontraron Service Plans para eliminar${NC}"
fi
echo ""

# 2. Obtener y eliminar todas las Screen Options
echo -e "${BLUE}📺 ELIMINANDO SCREEN OPTIONS${NC}"
echo "============================="

screens_response=$(curl -s "$BASE_URL/admin/services/screen-options/service/$SERVICE_ID")
screen_ids=$(echo "$screens_response" | jq -r '.data[].screen_id // empty' 2>/dev/null)

if [ -n "$screen_ids" ]; then
    while IFS= read -r screen_id; do
        delete_item "/admin/services/screen-options/$screen_id" "Screen Option" "$screen_id"
    done <<< "$screen_ids"
else
    echo -e "${YELLOW}ℹ️  No se encontraron Screen Options para eliminar${NC}"
fi
echo ""

# 3. Obtener y eliminar todas las Month Options
echo -e "${BLUE}📅 ELIMINANDO MONTH OPTIONS${NC}"
echo "============================"

months_response=$(curl -s "$BASE_URL/admin/services/month-options/service/$SERVICE_ID")
month_ids=$(echo "$months_response" | jq -r '.data[].month_id // empty' 2>/dev/null)

if [ -n "$month_ids" ]; then
    while IFS= read -r month_id; do
        delete_item "/admin/services/month-options/$month_id" "Month Option" "$month_id"
    done <<< "$month_ids"
else
    echo -e "${YELLOW}ℹ️  No se encontraron Month Options para eliminar${NC}"
fi
echo ""

# 4. Verificar limpieza
echo -e "${BLUE}🔍 VERIFICANDO LIMPIEZA${NC}"
echo "======================="

echo -e "${YELLOW}🔹 Verificando Month Options restantes...${NC}"
remaining_months=$(curl -s "$BASE_URL/admin/services/month-options/service/$SERVICE_ID")
month_count=$(echo "$remaining_months" | jq '.data | length' 2>/dev/null || echo "0")
echo -e "${BLUE}   Month Options restantes: $month_count${NC}"

echo -e "${YELLOW}🔹 Verificando Screen Options restantes...${NC}"
remaining_screens=$(curl -s "$BASE_URL/admin/services/screen-options/service/$SERVICE_ID")
screen_count=$(echo "$remaining_screens" | jq '.data | length' 2>/dev/null || echo "0")
echo -e "${BLUE}   Screen Options restantes: $screen_count${NC}"

echo -e "${YELLOW}🔹 Verificando Service Plans restantes...${NC}"
remaining_plans=$(curl -s "$BASE_URL/admin/services/plans/service/$SERVICE_ID")
plan_count=$(echo "$remaining_plans" | jq '.data | length' 2>/dev/null || echo "0")
echo -e "${BLUE}   Service Plans restantes: $plan_count${NC}"

echo ""
echo -e "${GREEN}🎉 ================================="
echo "   LIMPIEZA COMPLETADA"
echo "=================================${NC}"

total_remaining=$((month_count + screen_count + plan_count))

if [ "$total_remaining" -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los datos de testing han sido eliminados${NC}"
    echo -e "${GREEN}✅ Base de datos limpia y lista para nuevas pruebas${NC}"
else
    echo -e "${YELLOW}⚠️  Quedan $total_remaining elementos sin eliminar${NC}"
    echo -e "${YELLOW}   Puedes ejecutar este script nuevamente si es necesario${NC}"
fi

echo ""
echo -e "${BLUE}📋 OPCIONES DISPONIBLES:${NC}"
echo "• ./scripts/test-pricing-system-complete.sh - Ejecutar pruebas completas"
echo "• ./scripts/verify-system-integrity.sh - Verificar integridad del sistema"
echo "• ./scripts/seed-pricing-data.js - Cargar datos de ejemplo"
echo ""
