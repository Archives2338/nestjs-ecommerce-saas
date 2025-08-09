#!/bin/bash

# 🎬 Agregar cuenta de Disney+ con 5 perfiles
# Email: vbusnc75@ranforp.club
# Password: Rew379a!

BASE_URL="http://localhost:3000"

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🎬 AGREGANDO CUENTA DE DISNEY+ 🎬${NC}"
echo "=================================="
echo "Email: vbusnc75@ranforp.club"
echo "Contraseña: Rew379a!"
echo "Perfiles: 5 (Familia)"
echo ""

# Crear cuenta de Disney+
echo -e "${GREEN}📝 Creando cuenta de Disney+...${NC}"

ACCOUNT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 2,
    "service_name": "Disney+",
    "account_type": "family",
    "credentials": {
      "email": "vbusnc75@ranforp.club",
      "password": "Rew379a!",
      "profile_name": "Principal"
    },
    "slot_info": {
      "max_slots": 5,
      "used_slots": 0,
      "assigned_to": []
    },
    "plan_type": "Disney+ Familia 5 perfiles",
    "subscription_expires_at": "2026-08-09T00:00:00.000Z",
    "notes": "Cuenta Disney+ familiar con 5 perfiles disponibles",
    "metadata": {
      "country": "PE",
      "region": "Lima",
      "device_limit": 5,
      "quality": "4K",
      "features": ["4K", "HDR", "Descargas", "Múltiples perfiles"]
    }
  }')

echo "$ACCOUNT_RESPONSE" | jq '.'

# Verificar si se creó correctamente
ACCOUNT_CODE=$(echo "$ACCOUNT_RESPONSE" | jq -r '.code // .statusCode // 999')
if [ "$ACCOUNT_CODE" = "0" ] || [ "$ACCOUNT_CODE" = "201" ]; then
    ACCOUNT_ID=$(echo "$ACCOUNT_RESPONSE" | jq -r '.data._id // .data.id // empty')
    echo -e "${GREEN}✅ Cuenta de Disney+ creada exitosamente${NC}"
    echo -e "${CYAN}🔑 Account ID: $ACCOUNT_ID${NC}"
    
    # Verificar la cuenta creada
    echo -e "\n${GREEN}🔍 Verificando cuenta creada...${NC}"
    VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/accounts/available/2")
    echo "$VERIFY_RESPONSE" | jq '.data[] | select(.credentials.email == "vbusnc75@ranforp.club") | {id: ._id, service: .service_name, slots: .slot_info, status: .status}'
    
else
    echo -e "${RED}❌ Error al crear la cuenta${NC}"
    echo "Respuesta: $ACCOUNT_RESPONSE"
fi

echo -e "\n${GREEN}📊 Resumen de cuentas de Disney+ disponibles:${NC}"
curl -s -X GET "$BASE_URL/api/accounts/available/2" | jq '.data | length as $count | "Total cuentas Disney+ disponibles: \($count)"'

echo -e "\n${CYAN}🎯 ¡Cuenta Disney+ lista para asignación automática!${NC}"
echo "=================================="
echo -e "${YELLOW}📋 Información de la cuenta:${NC}"
echo "• Servicio: Disney+ (service_id: 2)"
echo "• Email: vbusnc75@ranforp.club"
echo "• Contraseña: Rew379a!"
echo "• Tipo: Familia (5 perfiles)"
echo "• Estado: Disponible para asignación"
echo "• Vencimiento: 9 de agosto 2026"
echo ""
echo -e "${GREEN}✅ Ahora cuando un cliente compre Disney+ y el admin apruebe el pago,${NC}"
echo -e "${GREEN}   esta cuenta se asignará automáticamente.${NC}"
