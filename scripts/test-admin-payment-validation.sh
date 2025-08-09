#!/bin/bash

# Script para probar el sistema de validación administrativa de comprobantes
# Este script demuestra el flujo completo desde adjuntar comprobante hasta validación por admin

BASE_URL="http://localhost:3000"
TEST_EMAIL="admin@ejemplo.com"
TEST_PASSWORD="admin123"

echo "🔐 Iniciando pruebas del sistema de validación administrativa..."
echo "================================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "📋 1. Obteniendo comprobantes pendientes de validación..."
echo "GET $BASE_URL/api/admin/payments/pending"

PENDING_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments/pending" \
  -H "Content-Type: application/json")

echo "$PENDING_RESPONSE" | jq '.'

# Extraer el primer orderId si existe
ORDER_ID=$(echo "$PENDING_RESPONSE" | jq -r '.data.payments[0].orderId // empty')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo -e "${YELLOW}⚠️ No hay comprobantes pendientes para validar${NC}"
    echo -e "${BLUE}💡 Primero adjunta un comprobante con: PUT /api/orders/:id/comprobante${NC}"
    echo ""
    echo "Ejemplo de orden pendiente que puedes usar:"
    echo "curl -X PUT \"$BASE_URL/api/orders/ORDEN_ID/comprobante\" \\"
    echo "  -H \"Authorization: Bearer JWT_TOKEN\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{"
    echo "    \"comprobanteUrl\": \"https://example.com/comprobante.jpg\","
    echo "    \"paymentReference\": \"REF123456\","
    echo "    \"paymentAmount\": 17.00"
    echo "  }'"
    echo ""
    echo "Generando orden de ejemplo para demostración..."
    
    # Crear un ejemplo con orden ficticia
    ORDER_ID="674b1234567890abcdef1234"
else
    echo -e "${GREEN}✅ Encontrado comprobante pendiente: $ORDER_ID${NC}"
fi

echo ""
echo "================================================================"
echo ""

echo "🔍 2. Obteniendo detalles completos del comprobante..."
echo "GET $BASE_URL/api/admin/payments/$ORDER_ID/details"

DETAILS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments/$ORDER_ID/details" \
  -H "Content-Type: application/json")

echo "$DETAILS_RESPONSE" | jq '.'

echo ""
echo "================================================================"
echo ""

echo "📊 3. Obteniendo estadísticas de validaciones..."
echo "GET $BASE_URL/api/admin/payments/stats"

STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/payments/stats" \
  -H "Content-Type: application/json")

echo "$STATS_RESPONSE" | jq '.'

echo ""
echo "================================================================"
echo ""

echo "✅ 4. Probando APROBACIÓN de comprobante..."
echo "PUT $BASE_URL/api/admin/payments/$ORDER_ID/approve"

APPROVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/admin/payments/$ORDER_ID/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "adminNotes": "Comprobante validado correctamente. Datos del pago coinciden.",
    "adminId": "admin123",
    "autoAssignCredentials": true
  }')

echo "$APPROVE_RESPONSE" | jq '.'

APPROVE_CODE=$(echo "$APPROVE_RESPONSE" | jq -r '.code')
if [ "$APPROVE_CODE" = "0" ]; then
    echo -e "${GREEN}✅ Comprobante aprobado exitosamente${NC}"
    
    # Verificar si se asignaron credenciales automáticamente
    ASSIGNED_CREDS=$(echo "$APPROVE_RESPONSE" | jq -r '.data.assignedCredentials')
    if [ "$ASSIGNED_CREDS" != "null" ]; then
        echo -e "${GREEN}🎯 Credenciales asignadas automáticamente:${NC}"
        echo "$APPROVE_RESPONSE" | jq '.data.assignedCredentials'
    else
        echo -e "${YELLOW}⚠️ Credenciales no asignadas automáticamente${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Error o comprobante ya procesado${NC}"
fi

echo ""
echo "================================================================"
echo ""

echo "❌ 5. Probando RECHAZO de comprobante (con otro ID)..."
echo "PUT $BASE_URL/api/admin/payments/674b9876543210fedcba5678/reject"

REJECT_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/admin/payments/674b9876543210fedcba5678/reject" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "El comprobante está borroso y no se puede verificar el monto",
    "adminNotes": "Solicitar al cliente que envíe una imagen más clara",
    "adminId": "admin123"
  }')

echo "$REJECT_RESPONSE" | jq '.'

echo ""
echo "================================================================"
echo ""

echo "🔄 6. Probando re-asignación de credenciales..."
echo "POST $BASE_URL/api/admin/payments/$ORDER_ID/retry-assignment"

RETRY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/payments/$ORDER_ID/retry-assignment" \
  -H "Content-Type: application/json")

echo "$RETRY_RESPONSE" | jq '.'

echo ""
echo "================================================================"
echo ""

echo -e "${BLUE}📋 RESUMEN DEL SISTEMA DE VALIDACIÓN ADMINISTRATIVA:${NC}"
echo "✅ Endpoints implementados:"
echo "  • GET /api/admin/payments/pending - Lista comprobantes pendientes"
echo "  • GET /api/admin/payments/:id/details - Detalles completos"
echo "  • PUT /api/admin/payments/:id/approve - Aprobar comprobante"
echo "  • PUT /api/admin/payments/:id/reject - Rechazar comprobante"
echo "  • GET /api/admin/payments/stats - Estadísticas"
echo "  • POST /api/admin/payments/:id/retry-assignment - Re-asignar credenciales"
echo ""
echo "🎯 Características principales:"
echo "  • Validación administrativa manual de comprobantes"
echo "  • Asignación automática de credenciales al aprobar"
echo "  • Notificaciones por email (TODO: implementar)"
echo "  • Estadísticas de validaciones"
echo "  • Gestión completa de estados (pendiente/aprobado/rechazado)"
echo ""
echo "💡 Próximos pasos:"
echo "  • Implementar autenticación de administradores (AdminJwtAuthGuard)"
echo "  • Agregar servicio de envío de emails"
echo "  • Crear dashboard web para administradores"
echo "  • Implementar webhooks para notificaciones automáticas"
echo ""
echo -e "${GREEN}✅ Pruebas del sistema de validación administrativa completadas${NC}"
