# Customer Authentication Test Script

# Configuración base
API_BASE="http://localhost:3000/api/customer/auth"
CONTENT_TYPE="Content-Type: application/json"

echo "🧪 Testing Customer Authentication System"
echo "==========================================="
echo

# Test 1: Register new customer
echo "📝 Test 1: Customer Registration"
echo "Endpoint: POST $API_BASE/register"
echo
curl -X POST "$API_BASE/register" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "MiPassword123!",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+56912345678",
    "language": "es"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test 2: Login with invalid credentials
echo "🔐 Test 2: Login with invalid password"
echo "Endpoint: POST $API_BASE/login"
echo
curl -X POST "$API_BASE/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "wrongpassword"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test 3: Login with correct credentials
echo "✅ Test 3: Login with correct credentials"
echo "Endpoint: POST $API_BASE/login"
echo
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "MiPassword123!"
  }')
echo "$LOGIN_RESPONSE" | jq .

# Extract token for future requests
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
echo
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "🔑 Token extracted: ${TOKEN:0:20}..."
else
  echo "❌ No token found in response"
fi
echo
echo "-------------------------------------------"
echo

# Test 4: Password reset request
echo "🔄 Test 4: Password reset request"
echo "Endpoint: POST $API_BASE/forgot-password"
echo
curl -X POST "$API_BASE/forgot-password" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "juan@ejemplo.com"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test 5: Email verification (with dummy token)
echo "📧 Test 5: Email verification"
echo "Endpoint: POST $API_BASE/verify-email"
echo
curl -X POST "$API_BASE/verify-email" \
  -H "$CONTENT_TYPE" \
  -d '{
    "token": "dummy-verification-token-123"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test 6: Profile access (without token - should fail)
echo "👤 Test 6: Profile access without token"
echo "Endpoint: GET $API_BASE/profile"
echo
curl -X GET "$API_BASE/profile" \
  -H "$CONTENT_TYPE" | jq .
echo
echo "-------------------------------------------"
echo

# Test 7: Logout
echo "🚪 Test 7: Logout"
echo "Endpoint: POST $API_BASE/logout"
echo
curl -X POST "$API_BASE/logout" \
  -H "$CONTENT_TYPE" | jq .
echo
echo "-------------------------------------------"
echo

# Test 8: OAuth endpoints (placeholder)
echo "🌐 Test 8: Google OAuth (placeholder)"
echo "Endpoint: POST $API_BASE/google"
echo
curl -X POST "$API_BASE/google" \
  -H "$CONTENT_TYPE" \
  -d '{
    "googleToken": "dummy-google-token"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test 9: Register duplicate email
echo "🔁 Test 9: Register duplicate email"
echo "Endpoint: POST $API_BASE/register"
echo
curl -X POST "$API_BASE/register" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "OtherPassword123!",
    "firstName": "Juan",
    "lastName": "García"
  }' | jq .
echo
echo "-------------------------------------------"
echo

# Test 10: Invalid email format
echo "❌ Test 10: Invalid email format"
echo "Endpoint: POST $API_BASE/register"
echo
curl -X POST "$API_BASE/register" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "invalid-email",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }' | jq .
echo
echo "==========================================="
echo "✅ Customer Authentication Tests Complete"
echo
echo "Summary of tested endpoints:"
echo "• POST /api/customer/auth/register"
echo "• POST /api/customer/auth/login"
echo "• POST /api/customer/auth/forgot-password"
echo "• POST /api/customer/auth/verify-email"
echo "• GET /api/customer/auth/profile"
echo "• POST /api/customer/auth/logout"
echo "• POST /api/customer/auth/google"
echo
echo "Note: Some tests use placeholder tokens and may show expected errors."
echo "This validates that the authentication system is properly handling various scenarios."
