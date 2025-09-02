#!/bin/bash

# Script para verificar que los datos de pricing se insertaron correctamente

echo "🔍 Verificando datos insertados en el sistema de pricing modular..."

# Variables
API_BASE="http://localhost:3000/api"
SERVICE_ID="673a5299e2f1234567890111"

echo ""
echo "📅 1. Verificando opciones de meses..."
MONTH_OPTIONS=$(curl -s -X GET "$API_BASE/admin/services/month-options/service/$SERVICE_ID")

if [ "$?" -eq 0 ]; then
    echo "✅ Endpoint de opciones de meses accesible"
    echo $MONTH_OPTIONS | jq -r '.data[]? | "   📅 Mes \(.month) (\(.month_content)) - ID: \(.month_id) - Default: \(.is_default)"' 2>/dev/null || echo "   ⚠️ No se pudieron procesar los datos o no hay datos"
else
    echo "❌ Error accediendo al endpoint de opciones de meses"
fi

echo ""
echo "📺 2. Verificando opciones de pantallas..."
SCREEN_OPTIONS=$(curl -s -X GET "$API_BASE/admin/services/screen-options/service/$SERVICE_ID")

if [ "$?" -eq 0 ]; then
    echo "✅ Endpoint de opciones de pantallas accesible"
    echo $SCREEN_OPTIONS | jq -r '.data[]? | "   🖥️ \(.screen) pantalla(s) (\(.screen_content)) - ID: \(.screen_id) - Usuarios: \(.max_user)"' 2>/dev/null || echo "   ⚠️ No se pudieron procesar los datos o no hay datos"
else
    echo "❌ Error accediendo al endpoint de opciones de pantallas"
fi

echo ""
echo "💰 3. Verificando planes de precios..."
PRICING_PLANS=$(curl -s -X GET "$API_BASE/admin/services/plans/service/$SERVICE_ID")

if [ "$?" -eq 0 ]; then
    echo "✅ Endpoint de planes de precios accesible"
    echo $PRICING_PLANS | jq -r '.data[]? | "   💳 Plan ID: \(.type_plan_id) - Mes: \(.month_id) - Pantalla: \(.screen_id) - Precio: \(.currency_icon1)\(.sale_price) (desc: \(.discount))"' 2>/dev/null || echo "   ⚠️ No se pudieron procesar los datos o no hay datos"
else
    echo "❌ Error accediendo al endpoint de planes de precios"
fi

echo ""
echo "🎯 4. Verificando matriz de precios..."
PRICING_MATRIX=$(curl -s -X GET "$API_BASE/admin/services/plans/matrix/$SERVICE_ID")

if [ "$?" -eq 0 ]; then
    echo "✅ Endpoint de matriz de precios accesible"
    echo $PRICING_MATRIX | jq '.' 2>/dev/null || echo "   ⚠️ No se pudo procesar la matriz"
else
    echo "❌ Error accediendo al endpoint de matriz de precios"
fi

echo ""
echo "📊 5. Resumen de verificación..."

# Contar elementos
MONTH_COUNT=$(echo $MONTH_OPTIONS | jq '.data | length' 2>/dev/null || echo "0")
SCREEN_COUNT=$(echo $SCREEN_OPTIONS | jq '.data | length' 2>/dev/null || echo "0")
PLAN_COUNT=$(echo $PRICING_PLANS | jq '.data | length' 2>/dev/null || echo "0")

echo "   📅 Opciones de meses encontradas: $MONTH_COUNT"
echo "   📺 Opciones de pantallas encontradas: $SCREEN_COUNT"
echo "   💰 Planes de precios encontrados: $PLAN_COUNT"

EXPECTED_PLANS=$((MONTH_COUNT * SCREEN_COUNT))
echo "   🎯 Combinaciones esperadas: $EXPECTED_PLANS"

if [ "$PLAN_COUNT" -eq "$EXPECTED_PLANS" ] && [ "$PLAN_COUNT" -gt 0 ]; then
    echo "   ✅ ¡Todos los datos están correctos!"
elif [ "$PLAN_COUNT" -gt 0 ]; then
    echo "   ⚠️ Hay datos pero pueden estar incompletos"
else
    echo "   ❌ No se encontraron datos de pricing"
fi

echo ""
echo "🔧 Si no ves datos:"
echo "1. Asegúrate de que el servidor esté corriendo: npm run start:dev"
echo "2. Verifica que el SERVICE_ID existe: $SERVICE_ID"
echo "3. Ejecuta el seeding: node scripts/seed-pricing-data.js"
echo "4. Revisa los logs del servidor para errores"
