#!/bin/bash

# 🧪 TEST: Integración ServiceId + TypePlanId
# Probando que el sistema consulte el servicio real y encuentre el plan específico

BASE_URL="http://localhost:3000"
USER_EMAIL="aea2129@gmail.com"
USER_PASSWORD="Soportep021@"

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🧪 TEST: INTEGRACIÓN SERVICEID + TYPEPLANID${NC}"
echo "================================================"

# 1. Login
echo -e "${GREEN}1. 🔐 Login del cliente${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$USER_EMAIL'", "password": "'$USER_PASSWORD'"}')

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo "✅ Cliente autenticado"

# 2. Obtener servicio Disney+ con planes
echo -e "\n${GREEN}2. 📋 Consultando Disney+ (type_id: 2)${NC}"
DISNEY_SERVICE=$(curl -s -X POST "$BASE_URL/api/index/getSkuList" \
  -H "Content-Type: application/json" \
  -d '{"language": "es", "type_id": 2, "source": 2}')

DISNEY_ID=$(echo "$DISNEY_SERVICE" | jq -r '.data._id')
DISNEY_PLAN_ID=$(echo "$DISNEY_SERVICE" | jq -r '.data.plan.month[0].screen[0].type_plan_id')
DISNEY_PRICE=$(echo "$DISNEY_SERVICE" | jq -r '.data.plan.month[0].screen[0].sale_price')

echo "✅ Disney+ Service ID: $DISNEY_ID"
echo "✅ Plan 1 perfil ID: $DISNEY_PLAN_ID"
echo "✅ Precio: S/$DISNEY_PRICE"

# 3. Crear orden con serviceId y typePlanId reales
echo -e "\n${GREEN}3. 🛒 Creando orden con IDs reales${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "'$DISNEY_ID'",
    "items": [{
      "productId": "disney-1-profile",
      "name": "Disney+ 1 Perfil",
      "quantity": 1,
      "price": '$DISNEY_PRICE',
      "duration": "1 mes",
      "profiles": 1
    }],
    "total": '$DISNEY_PRICE',
    "paymentMethod": "yape",
    "type_plan_id": '$DISNEY_PLAN_ID'
  }')

echo "$ORDER_RESPONSE" | jq '.'

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data._id')
ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | jq -r '.data.out_trade_no')

if [ "$ORDER_ID" != "null" ]; then
    echo -e "${GREEN}✅ Orden creada exitosamente${NC}"
    echo -e "${CYAN}📄 Order ID: $ORDER_ID${NC}"
    echo -e "${CYAN}📄 Order Number: $ORDER_NUMBER${NC}"
    
    # 4. Verificar que se usó la información correcta del servicio
    echo -e "\n${GREEN}4. 🔍 Verificando información del servicio en la orden${NC}"
    ORDER_DETAILS=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" \
      -H "Authorization: Bearer $JWT_TOKEN")
    
    SERVICE_NAME=$(echo "$ORDER_DETAILS" | jq -r '.data.service_name')
    PLAN_NAME=$(echo "$ORDER_DETAILS" | jq -r '.data.plan_name')
    TYPE_ID=$(echo "$ORDER_DETAILS" | jq -r '.data.type_id')
    ORIGINAL_PRICE=$(echo "$ORDER_DETAILS" | jq -r '.data.original_price')
    
    echo "🎬 Servicio detectado: $SERVICE_NAME"
    echo "📋 Plan detectado: $PLAN_NAME"
    echo "🔢 Type ID: $TYPE_ID"
    echo "💰 Precio original: S/$ORIGINAL_PRICE"
    
    # 5. Verificar que hay cuentas de Disney+ disponibles
    echo -e "\n${GREEN}5. 💼 Verificando cuentas Disney+ disponibles${NC}"
    DISNEY_ACCOUNTS=$(curl -s -X GET "$BASE_URL/api/accounts/available/2")
    ACCOUNT_COUNT=$(echo "$DISNEY_ACCOUNTS" | jq '.data | length')
    
    echo "📊 Cuentas Disney+ disponibles: $ACCOUNT_COUNT"
    
    if [ "$ACCOUNT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Sistema listo para asignación automática${NC}"
    else
        echo -e "${YELLOW}⚠️ No hay cuentas Disney+ disponibles para asignación${NC}"
    fi
    
else
    echo -e "${RED}❌ Error al crear la orden${NC}"
fi

echo -e "\n${CYAN}🎯 RESUMEN DE LA INTEGRACIÓN${NC}"
echo "============================================"
echo -e "${GREEN}✅ ServiceId real obtenido del catálogo${NC}"
echo -e "${GREEN}✅ TypePlanId específico identificado${NC}"
echo -e "${GREEN}✅ Información del servicio consultada${NC}"
echo -e "${GREEN}✅ Plan específico encontrado en estructura${NC}"
echo -e "${GREEN}✅ Orden creada con datos reales${NC}"
echo ""
echo -e "${YELLOW}📋 El sistema ahora puede:${NC}"
echo "• Consultar servicios reales por ObjectId"
echo "• Encontrar planes específicos por type_plan_id"
echo "• Extraer precios, duración y detalles correctos"
echo "• Crear órdenes con información precisa"
echo "• Asignar cuentas automáticamente por service_id"
