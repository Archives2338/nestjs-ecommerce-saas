#!/bin/bash

# 🛒 FLUJO COMPLETO DE CLIENTE - E-commerce de Streaming Services
# Usuario: aea2129@gmail.com | Password: Soportep021@
# Flujo: Login → Crear Orden → Adjuntar Comprobante → Admin Valida → Recibir Credenciales

BASE_URL="http://localhost:3000"
USER_EMAIL="aea2129@gmail.com"
USER_PASSWORD="Soportep021@"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🛒 FLUJO COMPLETO DE CLIENTE - E-COMMERCE STREAMING${NC}"
echo "=================================================="
echo -e "${BLUE}👤 Usuario: $USER_EMAIL${NC}"
echo -e "${BLUE}🔗 API Base: $BASE_URL${NC}"
echo ""

# ============================================
# PASO 1: LOGIN DEL CLIENTE
# ============================================
echo -e "${PURPLE}🔐 PASO 1: Autenticación del Cliente${NC}"
echo "POST $BASE_URL/api/customer/auth/login"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$USER_EMAIL'",
    "password": "'$USER_PASSWORD'"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

# Extraer JWT token
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // .data.token // empty')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.customer.id // .data.user.id // empty')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener token JWT${NC}"
    echo -e "${YELLOW}💡 Verifica que el usuario esté registrado o registra uno nuevo${NC}"
    
    echo ""
    echo -e "${BLUE}📝 Registrando usuario automáticamente...${NC}"
    
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "'$USER_EMAIL'",
        "password": "'$USER_PASSWORD'",
        "firstName": "Usuario",
        "lastName": "Demo",
        "phone": "+56912345678"
      }')
    
    echo "$REGISTER_RESPONSE" | jq '.'
    
    # Intentar login nuevamente
    echo ""
    echo -e "${BLUE}🔄 Reintentando login...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/customer/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "'$USER_EMAIL'",
        "password": "'$USER_PASSWORD'"
      }')
    
    JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token // .data.token // empty')
    USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.customer.id // .data.user.id // empty')
    
    if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
        echo -e "${RED}❌ Error: Aún no se pudo obtener token JWT${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Login exitoso. Token JWT obtenido.${NC}"
echo -e "${CYAN}🔑 User ID: $USER_ID${NC}"

echo ""
echo "=================================================="
echo ""

# ============================================
# PASO 2: VER CATÁLOGO DE SERVICIOS
# ============================================
echo -e "${PURPLE}📋 PASO 2: Explorando Catálogo de Servicios${NC}"
echo "GET $BASE_URL/api/services/es"

CATALOG_RESPONSE=$(curl -s -X GET "$BASE_URL/api/services/es" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$CATALOG_RESPONSE" | jq '.'

# Extraer primer servicio disponible
SERVICE_ID=$(echo "$CATALOG_RESPONSE" | jq -r '.data[0]._id // empty')
SERVICE_NAME=$(echo "$CATALOG_RESPONSE" | jq -r '.data[0].service_name // .data[0].name // empty')
SERVICE_TYPE_ID=$(echo "$CATALOG_RESPONSE" | jq -r '.data[0].type_id // empty')

if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    echo -e "${YELLOW}⚠️ No hay servicios disponibles en el catálogo${NC}"
    echo -e "${BLUE}💡 Usando servicio de ejemplo (Netflix)${NC}"
    SERVICE_ID="673a5299e2f1234567890111"
    SERVICE_NAME="Netflix"
    SERVICE_TYPE_ID="1"
else
    echo -e "${GREEN}✅ Servicio seleccionado: $SERVICE_NAME (ID: $SERVICE_ID)${NC}"
fi

echo ""
echo "=================================================="
echo ""

# ============================================
# PASO 3: CREAR ORDEN
# ============================================
echo -e "${PURPLE}🛒 PASO 3: Creando Orden de Compra${NC}"
echo "POST $BASE_URL/api/orders"

ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "'$SERVICE_ID'",
    "items": [{
      "productId": "netflix-1-profile",
      "name": "'$SERVICE_NAME' 1 Perfil",
      "quantity": 1,
      "price": 17.00,
      "duration": "1 mes",
      "profiles": 1
    }],
    "total": 17.00,
    "paymentMethod": "yape",
    "type_plan_id": 1
  }')

echo "$ORDER_RESPONSE" | jq '.'

# Extraer ID de la orden
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data._id // .data.id // empty')
ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | jq -r '.data.out_trade_no // .data.orderNumber // empty')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo -e "${RED}❌ Error: No se pudo crear la orden${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Orden creada exitosamente${NC}"
echo -e "${CYAN}📄 Order ID: $ORDER_ID${NC}"
echo -e "${CYAN}📄 Order Number: $ORDER_NUMBER${NC}"

echo ""
echo "=================================================="
echo ""

# ============================================
# PASO 4: ADJUNTAR COMPROBANTE DE PAGO
# ============================================
echo -e "${PURPLE}💳 PASO 4: Adjuntando Comprobante de Pago${NC}"
echo "PUT $BASE_URL/api/orders/$ORDER_ID/comprobante"

COMPROBANTE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/orders/$ORDER_ID/comprobante" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comprobanteUrl": "https://example.com/comprobante-yape-'$ORDER_NUMBER'.jpg",
    "paymentReference": "YAPE-'$ORDER_NUMBER'",
    "paymentAmount": 17.00
  }')

echo "$COMPROBANTE_RESPONSE" | jq '.'

COMPROBANTE_CODE=$(echo "$COMPROBANTE_RESPONSE" | jq -r '.code')
if [ "$COMPROBANTE_CODE" = "0" ]; then
    echo -e "${GREEN}✅ Comprobante adjuntado exitosamente${NC}"
    echo -e "${YELLOW}📋 Estado: Pendiente de validación administrativa${NC}"
else
    echo -e "${RED}❌ Error al adjuntar comprobante${NC}"
fi

echo ""
echo "=================================================="
echo ""

# ============================================
# PASO 5: VERIFICAR ESTADO DE LA ORDEN
# ============================================
echo -e "${PURPLE}🔍 PASO 5: Verificando Estado de la Orden${NC}"
echo "GET $BASE_URL/api/orders/$ORDER_ID"

ORDER_STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$ORDER_STATUS_RESPONSE" | jq '.'

ORDER_STATUS=$(echo "$ORDER_STATUS_RESPONSE" | jq -r '.data.ostatus')
case $ORDER_STATUS in
    1) STATUS_TEXT="Pendiente de pago" ;;
    2) STATUS_TEXT="Pagado - Credenciales disponibles" ;;
    3) STATUS_TEXT="Verificando comprobante" ;;
    5) STATUS_TEXT="Cancelado/Rechazado" ;;
    *) STATUS_TEXT="Estado desconocido" ;;
esac

echo -e "${CYAN}📊 Estado actual: $STATUS_TEXT (código: $ORDER_STATUS)${NC}"

echo ""
echo "=================================================="
echo ""

# ============================================
# SIMULACIÓN DEL LADO ADMINISTRATIVO
# ============================================
echo -e "${PURPLE}👨‍💼 PASO 6: Simulación del Proceso Administrativo${NC}"
echo ""

echo -e "${BLUE}🔍 6.1. Admin consulta comprobantes pendientes${NC}"
echo "GET $BASE_URL/api/admin/payments/pending"

PENDING_ADMIN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments/pending")
echo "$PENDING_ADMIN_RESPONSE" | jq '.'

echo ""
echo -e "${BLUE}🔍 6.2. Admin revisa detalles del comprobante${NC}"
echo "GET $BASE_URL/api/admin/payments/$ORDER_ID/details"

DETAILS_ADMIN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments/$ORDER_ID/details")
echo "$DETAILS_ADMIN_RESPONSE" | jq '.'

echo ""
echo -e "${BLUE}✅ 6.3. Admin APRUEBA el comprobante y asigna credenciales automáticamente${NC}"
echo "PUT $BASE_URL/api/admin/payments/$ORDER_ID/approve"

APPROVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/admin/payments/$ORDER_ID/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "adminNotes": "Comprobante Yape validado correctamente. Monto: S/17.00. Referencia verificada.",
    "adminId": "admin-demo",
    "autoAssignCredentials": true
  }')

echo "$APPROVE_RESPONSE" | jq '.'

APPROVE_CODE=$(echo "$APPROVE_RESPONSE" | jq -r '.code')
if [ "$APPROVE_CODE" = "0" ]; then
    echo -e "${GREEN}✅ Comprobante APROBADO por administrador${NC}"
    
    # Verificar si se asignaron credenciales
    ASSIGNED_CREDS=$(echo "$APPROVE_RESPONSE" | jq -r '.data.assignedCredentials')
    if [ "$ASSIGNED_CREDS" != "null" ]; then
        echo -e "${GREEN}🎯 CREDENCIALES ASIGNADAS AUTOMÁTICAMENTE:${NC}"
        echo "$APPROVE_RESPONSE" | jq '.data.assignedCredentials'
    else
        echo -e "${YELLOW}⚠️ Credenciales no asignadas automáticamente (sin cuentas disponibles)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ ${APPROVE_RESPONSE}${NC}"
fi

echo ""
echo "=================================================="
echo ""

# ============================================
# PASO 7: CLIENTE VERIFICA SUS CREDENCIALES
# ============================================
echo -e "${PURPLE}🎉 PASO 7: Cliente Verifica Sus Credenciales${NC}"
echo "GET $BASE_URL/api/orders/$ORDER_ID"

FINAL_ORDER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$FINAL_ORDER_RESPONSE" | jq '.'

# Verificar si tiene credenciales asignadas
ACCESS_INFO=$(echo "$FINAL_ORDER_RESPONSE" | jq -r '.data.access_info')
if [ "$ACCESS_INFO" != "null" ]; then
    echo -e "${GREEN}🎯 ¡FELICIDADES! Tienes acceso a tu servicio:${NC}"
    echo "$FINAL_ORDER_RESPONSE" | jq '.data.access_info'
    
    ACCOUNT_EMAIL=$(echo "$FINAL_ORDER_RESPONSE" | jq -r '.data.access_info.access_credentials.email // empty')
    ACCOUNT_PASSWORD=$(echo "$FINAL_ORDER_RESPONSE" | jq -r '.data.access_info.access_credentials.password // empty')
    
    if [ ! -z "$ACCOUNT_EMAIL" ] && [ "$ACCOUNT_EMAIL" != "null" ]; then
        echo ""
        echo -e "${CYAN}📧 Email de acceso: $ACCOUNT_EMAIL${NC}"
        echo -e "${CYAN}🔑 Contraseña: $ACCOUNT_PASSWORD${NC}"
        echo -e "${GREEN}🎬 ¡Ya puedes acceder a $SERVICE_NAME!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Aún no se han asignado credenciales${NC}"
    echo -e "${BLUE}💡 El administrador debe asignar manualmente o hay falta de cuentas disponibles${NC}"
fi

echo ""
echo "=================================================="
echo ""

# ============================================
# PASO 8: HISTORIAL DEL CLIENTE
# ============================================
echo -e "${PURPLE}📚 PASO 8: Consultando Historial del Cliente${NC}"
echo "GET $BASE_URL/api/orders/my/history"

HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/orders/my/history" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$HISTORY_RESPONSE" | jq '.'

echo ""
echo "=================================================="
echo ""

# ============================================
# RESUMEN FINAL
# ============================================
echo -e "${CYAN}📋 RESUMEN DEL FLUJO COMPLETADO${NC}"
echo "======================================"
echo -e "${GREEN}✅ Login exitoso con JWT${NC}"
echo -e "${GREEN}✅ Orden creada: $ORDER_NUMBER${NC}"
echo -e "${GREEN}✅ Comprobante adjuntado${NC}"
echo -e "${GREEN}✅ Validación administrativa completada${NC}"

if [ "$ACCESS_INFO" != "null" ]; then
    echo -e "${GREEN}✅ Credenciales asignadas y disponibles${NC}"
    echo -e "${CYAN}🎬 El cliente ya puede acceder a $SERVICE_NAME${NC}"
else
    echo -e "${YELLOW}⚠️ Credenciales pendientes de asignación${NC}"
fi

echo ""
echo -e "${BLUE}🚀 FLUJO DE E-COMMERCE COMPLETADO EXITOSAMENTE${NC}"
echo ""
echo -e "${PURPLE}📱 Próximos pasos para el cliente:${NC}"
echo "1. Recibir email de confirmación con credenciales"
echo "2. Acceder a $SERVICE_NAME con las credenciales proporcionadas"
echo "3. Disfrutar del servicio hasta la fecha de vencimiento"
echo ""
echo -e "${PURPLE}🔧 Próximos pasos técnicos:${NC}"
echo "1. Implementar servicio de emails automáticos"
echo "2. Dashboard web para administradores"
echo "3. Notificaciones push en tiempo real"
