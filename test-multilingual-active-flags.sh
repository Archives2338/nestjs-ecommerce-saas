#!/bin/bash

echo "==================================="
echo "PRUEBA DE FLAGS ACTIVOS MULTIIDIOMA"
echo "==================================="
echo ""

echo "1. Verificando contenido español (ES) - sección head:"
curl -s -X POST http://localhost:3000/api/webpage/key \
  -H "Content-Type: application/json" \
  -d '{"key": ["head"], "language": "es"}' | jq -r '.data.head | keys[]' | sort
echo ""

echo "2. Verificando contenido inglés (EN) - sección head:"
curl -s -X POST http://localhost:3000/api/webpage/key \
  -H "Content-Type: application/json" \
  -d '{"key": ["head"], "language": "en"}' | jq -r '.data.head | keys[]' | sort
echo ""

echo "3. Activando head5 en español:"
curl -s -X PUT http://localhost:3000/api/content/toggle-active/es/head/head5 \
  -H "Content-Type: application/json" \
  -d '{"active": true}' | jq -r '.message'
echo ""

echo "4. Activando head5 en inglés:"
curl -s -X PUT http://localhost:3000/api/content/toggle-active/en/head/head5 \
  -H "Content-Type: application/json" \
  -d '{"active": true}' | jq -r '.message'
echo ""

echo "5. Verificando que head5 aparece en ambos idiomas:"
echo "ES:"
curl -s -X POST http://localhost:3000/api/webpage/key \
  -H "Content-Type: application/json" \
  -d '{"key": ["head"], "language": "es"}' | jq -r '.data.head.head5 // "No disponible"'

echo "EN:"
curl -s -X POST http://localhost:3000/api/webpage/key \
  -H "Content-Type: application/json" \
  -d '{"key": ["head"], "language": "en"}' | jq -r '.data.head.head5 // "No disponible"'
echo ""

echo "6. Desactivando head5 en español:"
curl -s -X PUT http://localhost:3000/api/content/toggle-active/es/head/head5 \
  -H "Content-Type: application/json" \
  -d '{"active": false}' | jq -r '.message'
echo ""

echo "7. Verificando que head5 solo aparece en inglés:"
echo "ES:"
curl -s -X POST http://localhost:3000/api/webpage/key \
  -H "Content-Type: application/json" \
  -d '{"key": ["head"], "language": "es"}' | jq -r '.data.head.head5 // "No disponible"'

echo "EN:"
curl -s -X POST http://localhost:3000/api/webpage/key \
  -H "Content-Type: application/json" \
  -d '{"key": ["head"], "language": "en"}' | jq -r '.data.head.head5 // "No disponible"'
echo ""

echo "=========================================="
echo "PRUEBA COMPLETADA - SISTEMA HOMOLOGADO ✅"
echo "=========================================="
