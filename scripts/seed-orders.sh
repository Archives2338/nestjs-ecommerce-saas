#!/bin/bash

# Script para compilar y ejecutar el seeding de órdenes
# Uso: ./scripts/seed-orders.sh

echo "🚀 Compilando proyecto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación"
    exit 1
fi

echo "📦 Ejecutando seeding de órdenes..."
node dist/scripts/seed-orders.js

echo "✅ Proceso completado"
