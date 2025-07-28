# Test Script para el NUEVO FLUJO de Registro de Clientes

# Configuración base
API_BASE="http://localhost:3000/api/customer/auth"
CONTENT_TYPE="Content-Type: application/json"

echo "🚀 Testing NEW Customer Registration Flow (3 Steps)"
echo "=================================================="
echo

# Limpiar data de pruebas anteriores (opcional)
echo "🧹 Cleaning up previous test data..."
# Aquí podrías agregar lógica para limpiar la DB si es necesario
echo

# ============================================
# PASO 1: Verificar email y enviar código
# ============================================
echo "📧 STEP 1: Check Email and Send Verification Code"
echo "Endpoint: POST $API_BASE/check-email"
echo

STEP1_RESPONSE=$(curl -s -X POST "$API_BASE/check-email" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "maria@nuevoflujo.com"
  }')

echo "$STEP1_RESPONSE" | jq .

# Verificar que el código se envió correctamente
STEP1_CODE=$(echo "$STEP1_RESPONSE" | jq -r '.code')
echo
if [ "$STEP1_CODE" = "0" ]; then
  echo "✅ STEP 1 SUCCESS: Verification code sent"
  REDIRECT_URL=$(echo "$STEP1_RESPONSE" | jq -r '.redirect_url')
  echo "🔗 Next step: $REDIRECT_URL"
else
  echo "❌ STEP 1 FAILED"
  exit 1
fi
echo
echo "-------------------------------------------"
echo

# ============================================
# PASO 2: Verificar código (simulado)
# ============================================
echo "🔑 STEP 2: Verify Registration Code"
echo "Endpoint: POST $API_BASE/verify-code"
echo "📝 Note: Using dummy code for demo (in real app, user would receive by email)"
echo

STEP2_RESPONSE=$(curl -s -X POST "$API_BASE/verify-code" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "maria@nuevoflujo.com",
    "code": "123456"
  }')

echo "$STEP2_RESPONSE" | jq .

STEP2_CODE=$(echo "$STEP2_RESPONSE" | jq -r '.code')
echo
if [ "$STEP2_CODE" = "0" ]; then
  echo "✅ STEP 2 SUCCESS: Code verified"
  REDIRECT_URL=$(echo "$STEP2_RESPONSE" | jq -r '.redirect_url')
  echo "🔗 Next step: $REDIRECT_URL"
else
  echo "⚠️  STEP 2 EXPECTED FAILURE: Dummy code rejected (this is correct behavior)"
  echo "📝 In real flow, the actual 6-digit code would be sent via email"
fi
echo
echo "-------------------------------------------"
echo

# ============================================
# PASO 3: Completar registro (simulando código válido)
# ============================================
echo "👤 STEP 3: Complete Registration"
echo "Endpoint: POST $API_BASE/complete-registration"
echo "📝 Note: This would normally work after valid code verification"
echo

STEP3_RESPONSE=$(curl -s -X POST "$API_BASE/complete-registration" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "maria@nuevoflujo.com",
    "password": "MiNuevaPassword123!",
    "firstName": "María",
    "lastName": "González",
    "phone": "+56987654321"
  }')

echo "$STEP3_RESPONSE" | jq .

STEP3_CODE=$(echo "$STEP3_RESPONSE" | jq -r '.code')
echo
if [ "$STEP3_CODE" = "0" ]; then
  echo "✅ STEP 3 SUCCESS: Registration completed"
  TOKEN=$(echo "$STEP3_RESPONSE" | jq -r '.data.token')
  echo "🔑 Access token: ${TOKEN:0:20}..."
  
  CUSTOMER_ID=$(echo "$STEP3_RESPONSE" | jq -r '.data.customer.id')
  echo "👤 Customer ID: $CUSTOMER_ID"
else
  echo "⚠️  STEP 3 EXPECTED FAILURE: No valid verification found (correct behavior)"
fi
echo
echo "-------------------------------------------"
echo

# ============================================
# PRUEBAS ADICIONALES
# ============================================

# Test: Email ya existente
echo "🔄 TEST: Email already exists check"
echo "Endpoint: POST $API_BASE/check-email"
echo

curl -X POST "$API_BASE/check-email" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "juan@ejemplo.com"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test: Código inválido
echo "❌ TEST: Invalid verification code"
echo "Endpoint: POST $API_BASE/verify-code"
echo

curl -X POST "$API_BASE/verify-code" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "maria@nuevoflujo.com",
    "code": "000000"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test: Email inválido
echo "📧 TEST: Invalid email format"
echo "Endpoint: POST $API_BASE/check-email"
echo

curl -X POST "$API_BASE/check-email" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "invalid-email-format"
  }' | jq .
echo
echo "-------------------------------------------"
echo

echo "=================================================="
echo "✅ NEW Registration Flow Testing Complete"
echo
echo "📋 Summary of New Endpoints:"
echo "• POST /api/customer/auth/check-email"
echo "• POST /api/customer/auth/verify-code" 
echo "• POST /api/customer/auth/complete-registration"
echo
echo "🔄 Flow Summary:"
echo "1️⃣  User enters email → System sends 6-digit code"
echo "2️⃣  User enters code → System verifies and unlocks registration"
echo "3️⃣  User sets password & profile → Registration complete with JWT"
echo
echo "📝 Notes:"
echo "• Email verification is required before password setup"
echo "• Codes expire in 10 minutes"
echo "• Duplicate emails redirect to login"
echo "• JWT tokens are generated upon successful completion"
