#!/bin/bash

echo "🧪 Probando el Sistema Multi-Tenant E-commerce"
echo "=============================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1️⃣ Probando acceso SIN tenant específico (debería usar 'default'):"
curl -X POST "$BASE_URL/index/getTypeClassifyList" \
  -H "Content-Type: application/json" \
  -d '{"language": "es"}' \
  -w "\nStatus: %{http_code}\n" \
  | head -20

echo ""
echo "2️⃣ Probando con HEADER X-Tenant-ID (Restaurante Pepito):"
curl -X POST "$BASE_URL/index/getTypeClassifyList" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: restaurante-pepito" \
  -d '{"language": "es"}' \
  -w "\nStatus: %{http_code}\n" \
  | head -20

echo ""
echo "3️⃣ Probando con QUERY PARAMETER (Tienda de Moda):"
curl -X POST "$BASE_URL/index/getTypeClassifyList?tenant=tienda-moda" \
  -H "Content-Type: application/json" \
  -d '{"language": "es"}' \
  -w "\nStatus: %{http_code}\n" \
  | head -20

echo ""
echo "4️⃣ Probando con SUBDOMINIO simulado (TechStore):"
curl -X POST "$BASE_URL/index/getTypeClassifyList" \
  -H "Content-Type: application/json" \
  -H "Host: tech-store.localhost:3000" \
  -d '{"language": "es"}' \
  -w "\nStatus: %{http_code}\n" \
  | head -20

echo ""
echo "5️⃣ Listando todos los tenants creados:"
curl -X GET "$BASE_URL/tenants" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  | head -30

echo ""
echo "6️⃣ Obteniendo información específica del tenant 'restaurante-pepito':"
curl -X GET "$BASE_URL/tenants/restaurante-pepito" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "🎉 ¡Pruebas completadas!"
echo ""
echo "💡 Tips para seguir probando:"
echo "- Cambia el header X-Tenant-ID a diferentes valores"
echo "- Prueba con ?tenant=tech-store en la URL"
echo "- Crea nuevos tenants con POST /tenants"
echo "- Cada tenant tendrá su propio catálogo aislado"
