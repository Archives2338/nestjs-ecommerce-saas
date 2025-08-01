#!/bin/bash

echo "🎬 Testing Disney+ Service Integration"
echo "===================================="
echo ""

# Configuración base
API_BASE="http://localhost:3001"
CONTENT_TYPE="Content-Type: application/json"

echo "📋 Test 1: Get Catalog with Disney+ (should appear first)"
echo "Endpoint: POST $API_BASE/index/getTypeClassifyList"
echo ""

curl -s -X POST "$API_BASE/index/getTypeClassifyList" \
  -H "$CONTENT_TYPE" \
  -d '{
    "language": "es"
  }' | jq '.data.list[0].spuList[0] | {id, type_name, min_price, currency_icon1, currency_icon2, description}'
echo ""
echo "-------------------------------------------"
echo ""

echo "🎯 Test 2: Get Disney+ Service Details (SKU List)"
echo "Endpoint: POST $API_BASE/index/getSkuList"
echo ""

curl -s -X POST "$API_BASE/index/getSkuList" \
  -H "$CONTENT_TYPE" \
  -d '{
    "language": "es",
    "type_id": 10,
    "source": 2
  }' | jq '.data | {id, type_name, plan: .plan.month[0].screen[0] | {currency_icon1, currency_icon2, original_price, sale_price, average_price}}'
echo ""
echo "-------------------------------------------"
echo ""

echo "💰 Test 3: Price Comparison (USD vs PEN)"
echo ""

# Get Netflix pricing (USD)
echo "Netflix (USD):"
curl -s -X POST "$API_BASE/index/getSkuList" \
  -H "$CONTENT_TYPE" \
  -d '{
    "language": "es", 
    "type_id": 1,
    "source": 2
  }' | jq -r '.data.plan.month[0].screen[0] | "Price: \(.currency_icon1)\(.sale_price) \(.currency_icon2)"'

# Get Disney+ pricing (PEN)
echo "Disney+ (PEN):"
curl -s -X POST "$API_BASE/index/getSkuList" \
  -H "$CONTENT_TYPE" \
  -d '{
    "language": "es",
    "type_id": 10, 
    "source": 2
  }' | jq -r '.data.plan.month[0].screen[0] | "Price: \(.currency_icon1)\(.sale_price) \(.currency_icon2)"'
echo ""
echo "-------------------------------------------"
echo ""

echo "📊 Test 4: All Available Services"
echo "Endpoint: GET $API_BASE/services/es"
echo ""

curl -s -X GET "$API_BASE/services/es" \
  -H "$CONTENT_TYPE" | jq '.data[] | {id, type_name}' 
echo ""
echo "-------------------------------------------"
echo ""

echo "✅ Disney+ Integration Tests Complete!"
echo ""
echo "🎯 Expected Results:"
echo "• Disney+ should appear FIRST in catalog (position 0)"
echo "• Prices should be in SOLES (S/) not dollars ($)"
echo "• Currency should show PEN(S/) format"
echo "• Plans: 6 meses (S/ 75.00) and 12 meses (S/ 112.50)"
echo ""
echo "💱 Exchange Rate Used: 1 USD = 3.75 PEN"
