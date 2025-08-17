#!/bin/bash

# Script para probar los endpoints de administración de servicios
# Asegúrate de que el servidor esté corriendo en localhost:3000

BASE_URL="http://localhost:3000/api/admin/services"
CONTENT_TYPE="Content-Type: application/json"

echo "🔧 Probando endpoints de administración de servicios..."
echo "=================================================="

# 1. Obtener estadísticas de servicios
echo ""
echo "📊 1. Obteniendo estadísticas de servicios..."
curl -X GET "${BASE_URL}/stats?language=es" \
  -H "${CONTENT_TYPE}" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Respuesta recibida (sin formato JSON)"

sleep 2

# 2. Obtener todos los servicios (primera página)
echo ""
echo "📋 2. Obteniendo lista de servicios (página 1)..."
curl -X GET "${BASE_URL}?language=es&page=1&limit=5" \
  -H "${CONTENT_TYPE}" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Respuesta recibida (sin formato JSON)"

sleep 2

# 3. Obtener solo servicios activos
echo ""
echo "✅ 3. Obteniendo servicios activos..."
curl -X GET "${BASE_URL}?language=es&active=true" \
  -H "${CONTENT_TYPE}" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Respuesta recibida (sin formato JSON)"

sleep 2

# 4. Obtener solo servicios inactivos
echo ""
echo "❌ 4. Obteniendo servicios inactivos..."
curl -X GET "${BASE_URL}?language=es&active=false" \
  -H "${CONTENT_TYPE}" \
  -w "\nStatus: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Respuesta recibida (sin formato JSON)"

sleep 2

# 5. Intentar obtener un servicio específico por ID
echo ""
echo "🔍 5. Intentando obtener servicio específico..."
echo "   (Nota: Necesitarás un ID real de MongoDB para esta prueba)"
# curl -X GET "${BASE_URL}/[ID_DEL_SERVICIO]" \
#   -H "${CONTENT_TYPE}" \
#   -w "\nStatus: %{http_code}\n" \
#   | jq '.' 2>/dev/null || echo "Respuesta recibida (sin formato JSON)"

echo ""
echo "🎉 Pruebas de lectura completadas!"
echo ""
echo "💡 Próximos pasos:"
echo "   - Usa los IDs reales de los servicios para probar GET específico"
echo "   - Prueba los endpoints de creación, actualización y eliminación"
echo "   - Verifica que los datos coincidan con los del seed"
echo ""
echo "📝 Ejemplos de uso:"
echo "   GET ${BASE_URL}                          # Listar todos"
echo "   GET ${BASE_URL}/stats                    # Estadísticas"
echo "   GET ${BASE_URL}/[ID]                     # Servicio específico"
echo "   POST ${BASE_URL}                         # Crear servicio"
echo "   PUT ${BASE_URL}/[ID]                     # Actualizar servicio"
echo "   POST ${BASE_URL}/[ID]/toggle-status      # Cambiar estado"
echo "   DELETE ${BASE_URL}/[ID]                  # Eliminar servicio"
