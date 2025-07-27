#!/bin/bash

echo "🧹 Limpiando puertos de NestJS..."

# Matar procesos en puertos comunes de NestJS
for port in 3000 3001 3002 8000 8080; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "🔫 Matando proceso en puerto $port"
    lsof -ti:$port | xargs kill -9
  fi
done

# Matar procesos de Node.js que contengan "nest"
pkill -f "nest" 2>/dev/null || true

echo "✅ Puertos limpiados!"

# Opcional: Mostrar puertos en uso
echo "📊 Puertos actualmente en uso:"
lsof -i -P -n | grep LISTEN | head -10
