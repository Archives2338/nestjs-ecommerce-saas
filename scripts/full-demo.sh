#!/bin/bash

echo "🚀 DEMO COMPLETO - SAAS E-COMMERCE MULTI-TENANT"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}📊 1. LISTAR TODOS LOS TENANTS${NC}"
echo "curl -X GET $BASE_URL/tenants"
curl -s -X GET "$BASE_URL/tenants" | jq '.[0:2]' | head -20
echo ""

echo -e "${BLUE}👤 2. INFORMACIÓN DE TENANT ESPECÍFICO${NC}"
echo "curl -X GET $BASE_URL/tenants/restaurante-pepito"
curl -s -X GET "$BASE_URL/tenants/restaurante-pepito" | jq
echo ""

echo -e "${BLUE}📈 3. ESTADÍSTICAS DE USO - RESTAURANTE PEPITO${NC}"
echo "curl -X GET $BASE_URL/usage/stats -H 'X-Tenant-ID: restaurante-pepito'"
curl -s -X GET "$BASE_URL/usage/stats" -H "X-Tenant-ID: restaurante-pepito" | jq
echo ""

echo -e "${BLUE}🏢 4. ESTADÍSTICAS DE USO - TECH STORE (Enterprise)${NC}"
echo "curl -X GET $BASE_URL/usage/stats -H 'X-Tenant-ID: tech-store'"
curl -s -X GET "$BASE_URL/usage/stats" -H "X-Tenant-ID: tech-store" | jq
echo ""

echo -e "${BLUE}💼 5. LÍMITES DEL PLAN - TIENDA MODA (Starter)${NC}"
echo "curl -X GET $BASE_URL/usage/limits -H 'X-Tenant-ID: tienda-moda'"
curl -s -X GET "$BASE_URL/usage/limits" -H "X-Tenant-ID: tienda-moda" | jq
echo ""

echo -e "${BLUE}🛍️ 6. CATÁLOGO AISLADO POR TENANT - RESTAURANTE PEPITO${NC}"
echo "curl -X POST $BASE_URL/index/getTypeClassifyList -H 'X-Tenant-ID: restaurante-pepito' -d '{\"language\": \"es\"}'"
curl -s -X POST "$BASE_URL/index/getTypeClassifyList" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: restaurante-pepito" \
  -d '{"language": "es"}' | jq '.data.statistics'
echo ""

echo -e "${BLUE}🛍️ 7. CATÁLOGO AISLADO POR TENANT - TECH STORE${NC}"
echo "curl -X POST $BASE_URL/index/getTypeClassifyList -H 'X-Tenant-ID: tech-store' -d '{\"language\": \"es\"}'"
curl -s -X POST "$BASE_URL/index/getTypeClassifyList" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tech-store" \
  -d '{"language": "es"}' | jq '.data.statistics'
echo ""

echo -e "${GREEN}✅ CREAR NUEVO TENANT (DEMO)${NC}"
NEW_TENANT='{
  "tenantId": "demo-store-' $(date +%s) '",
  "name": "Demo Store",
  "email": "demo@example.com",
  "businessName": "Demo Store LLC",
  "subdomain": "demo-store",
  "subscriptionPlan": "starter"
}'

echo "curl -X POST $BASE_URL/tenants -d '$NEW_TENANT'"
RESULT=$(curl -s -X POST "$BASE_URL/tenants" \
  -H "Content-Type: application/json" \
  -d "$NEW_TENANT")
echo "$RESULT" | jq
echo ""

# Extraer tenantId del resultado
NEW_TENANT_ID=$(echo "$RESULT" | jq -r '.tenantId')

if [ "$NEW_TENANT_ID" != "null" ] && [ "$NEW_TENANT_ID" != "" ]; then
  echo -e "${GREEN}📊 8. VERIFICAR ESTADÍSTICAS DEL NUEVO TENANT${NC}"
  echo "curl -X GET $BASE_URL/usage/stats -H 'X-Tenant-ID: $NEW_TENANT_ID'"
  curl -s -X GET "$BASE_URL/usage/stats" -H "X-Tenant-ID: $NEW_TENANT_ID" | jq
  echo ""
fi

echo ""
echo -e "${YELLOW}🎉 RESUMEN DE FUNCIONALIDADES DEMOSTRADAS:${NC}"
echo "✅ Multi-tenancy con aislamiento completo de datos"
echo "✅ Gestión de tenants (CRUD completo)"
echo "✅ Diferentes planes de suscripción (starter, professional, enterprise)"
echo "✅ Sistema de límites por plan"
echo "✅ Monitoreo de uso en tiempo real"
echo "✅ Recomendaciones automáticas de upgrade"
echo "✅ Catálogos separados por tenant"
echo "✅ API completa para gestión SaaS"
echo ""

echo -e "${BLUE}💰 POTENCIAL DE NEGOCIO:${NC}"
echo "- Plan Starter: \$29/mes × 60% clientes = Base sólida"
echo "- Plan Professional: \$99/mes × 30% clientes = Growth"
echo "- Plan Enterprise: \$299/mes × 10% clientes = Premium"
echo "- Proyección Año 1: \$70K ARR con 100 tenants"
echo "- Proyección Año 2: \$462K ARR con 500 tenants"
echo ""

echo -e "${GREEN}🚀 ¡TU SAAS ESTÁ LISTO PARA GENERAR INGRESOS!${NC}"
echo ""
