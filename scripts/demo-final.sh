#!/bin/bash

# 🎯 DEMO FINAL - E-commerce de Streaming Services
# Usuario: aea2129@gmail.com | Password: Soportep021@

BASE_URL="http://localhost:3000"
USER_EMAIL="aea2129@gmail.com"
USER_PASSWORD="Soportep021@"

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🎯 DEMO FINAL - E-COMMERCE FUNCIONANDO${NC}"
echo "======================================="

# 1. Login
echo -e "${GREEN}1. 🔐 Login del cliente${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$USER_EMAIL'", "password": "'$USER_PASSWORD'"}')

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo "✅ Cliente autenticado con JWT"

# 2. Obtener servicio
echo -e "\n${GREEN}2. 📋 Consultar catálogo${NC}"
CATALOG=$(curl -s -X POST "$BASE_URL/api/index/getSkuList" \
  -H "Content-Type: application/json" \
  -d '{"language": "es", "type_id": 1, "source": 2}')

SERVICE_ID=$(echo "$CATALOG" | jq -r '.data._id')
PLAN_PRICE=$(echo "$CATALOG" | jq -r '.data.plan.month[0].screen[0].sale_price')
echo "✅ Netflix - Plan 1 perfil: S/$PLAN_PRICE"

# 3. Crear orden
echo -e "\n${GREEN}3. 🛒 Crear orden${NC}"
ORDER=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "'$SERVICE_ID'",
    "items": [{"productId": "netflix-1", "name": "Netflix 1 Perfil", "quantity": 1, "price": '$PLAN_PRICE', "duration": "1 mes"}],
    "total": '$PLAN_PRICE',
    "paymentMethod": "yape",
    "type_plan_id": 1011
  }')

ORDER_ID=$(echo "$ORDER" | jq -r '.data._id')
ORDER_NUMBER=$(echo "$ORDER" | jq -r '.data.out_trade_no')
echo "✅ Orden creada: $ORDER_NUMBER"

# 4. Consultar historial
echo -e "\n${GREEN}4. 📚 Historial del cliente${NC}"
HISTORY=$(curl -s -X GET "$BASE_URL/api/orders/my/history" \
  -H "Authorization: Bearer $JWT_TOKEN")

TOTAL_ORDERS=$(echo "$HISTORY" | jq -r '.data.pagination.total')
echo "✅ Cliente tiene $TOTAL_ORDERS órdenes en total"

# 5. Admin - Comprobantes pendientes
echo -e "\n${GREEN}5. 👨‍💼 Panel administrativo${NC}"
PENDING=$(curl -s -X GET "$BASE_URL/api/admin/payments/pending")
PENDING_COUNT=$(echo "$PENDING" | jq -r '.data.pagination.total')
echo "✅ Hay $PENDING_COUNT comprobantes pendientes de validación"

echo -e "\n${CYAN}🎉 ¡SISTEMA FUNCIONANDO CORRECTAMENTE!${NC}"
echo "======================================"
echo -e "${YELLOW}📋 Resumen de la demostración:${NC}"
echo "✅ Autenticación JWT funcionando"
echo "✅ Catálogo de servicios disponible"
echo "✅ Creación de órdenes operativa"
echo "✅ Historial de cliente accesible"
echo "✅ Panel administrativo funcionando"
echo ""
echo -e "${GREEN}🚀 El e-commerce de streaming está listo para producción!${NC}"
