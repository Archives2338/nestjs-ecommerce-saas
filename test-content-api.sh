#!/bin/bash

# Test API del Sistema de Contenido Multilingüe
# Backend NestJS E-commerce

echo "🚀 Probando Sistema de Contenido Multilingüe"
echo "============================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1. Recargando contenido mock en español..."
curl -s -X POST "$BASE_URL/api/webpage/es/reload-from-mock" | jq '.message'

echo ""
echo "2. Recargando contenido mock en inglés..."  
curl -s -X POST "$BASE_URL/api/webpage/en/reload-from-mock" | jq '.message'

echo ""
echo "3. Obteniendo textos específicos en español (home11, home12, home30)..."
curl -s -X POST "$BASE_URL/api/webpage/key" \
  -H "Content-Type: application/json" \
  -d '{"key": ["home11", "home12", "home30"], "language": "es"}' | jq '.data'

echo ""
echo "4. Obteniendo textos específicos en inglés (home11, home12, home30)..."
curl -s -X POST "$BASE_URL/api/webpage/key" \
  -H "Content-Type: application/json" \
  -d '{"key": ["home11", "home12", "home30"], "language": "en"}' | jq '.data'

echo ""
echo "5. Obteniendo textos de autenticación en español..."
curl -s -X POST "$BASE_URL/api/webpage/key" \
  -H "Content-Type: application/json" \
  -d '{"key": ["auth1", "auth2", "auth3"], "language": "es"}' | jq '.data'

echo ""
echo "6. Obteniendo textos de footer en inglés..."
curl -s -X POST "$BASE_URL/api/webpage/key" \
  -H "Content-Type: application/json" \
  -d '{"key": ["footer1", "footer2", "footer17"], "language": "en"}' | jq '.data'

echo ""
echo "7. Probando con clave inexistente..."
curl -s -X POST "$BASE_URL/api/webpage/key" \
  -H "Content-Type: application/json" \
  -d '{"key": ["nonexistent_key"], "language": "es"}' | jq '.data'

echo ""
echo "✅ Pruebas completadas!"
echo ""
echo "🎯 Resumen de funcionalidades probadas:"
echo "   - Carga de contenido mock desde archivos JSON"
echo "   - API compatible con GamsGo (POST /api/webpage/key)"
echo "   - Textos dinámicos con parámetros procesados"
echo "   - Soporte multilingüe (español e inglés)"
echo "   - Filtrado por claves específicas"
echo "   - Manejo de claves inexistentes"
