#!/bin/bash

echo "🚀 Script para subir proyecto a GitHub"
echo "====================================="

# Verificar que estamos en la rama correcta
echo "📍 Rama actual:"
git branch --show-current

echo ""
echo "🔄 Subiendo rama saas-multitenant..."
git push -u origin saas-multitenant

if [ $? -eq 0 ]; then
    echo "✅ Rama saas-multitenant subida exitosamente!"
    
    echo ""
    echo "🔄 Creando rama main para versión estándar..."
    git checkout -b main
    
    echo "📝 Eliminando archivos específicos de SaaS para la rama main..."
    git rm -r src/tenant/ src/usage/ src/common/guards/ 2>/dev/null || true
    git rm scripts/seed-tenants.ts scripts/full-demo.sh 2>/dev/null || true
    git rm BUSINESS_MODEL.md CONGRATULATIONS.md MULTI_TENANT_GUIDE.md NEXT_STEPS.md 2>/dev/null || true
    
    # Crear README específico para rama main
    cat > README.md << 'EOF'
# NestJS E-commerce Backend

E-commerce backend básico construido con NestJS, MongoDB y JWT.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Gestión de catálogo
- ✅ Sistema de configuración
- ✅ API REST completa
- ✅ Base de datos MongoDB
- ✅ Validación de datos

## 📦 Instalación

```bash
npm install
```

## 🔧 Configuración

Crea un archivo `.env`:

```env
DATABASE_URL=mongodb://localhost:27017/ecommerce
JWT_SECRET=tu_jwt_secret_aqui
```

## 🚀 Ejecutar

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## 📚 API Endpoints

- `GET /` - Health check
- `POST /authorize/sign_process` - Login
- `POST /index/getTypeClassifyList` - Catálogo
- `POST /index/siteConfig` - Configuración

## 🌟 Versión SaaS

Para la versión completa multi-tenant SaaS, cambia a la rama:

```bash
git checkout saas-multitenant
```

La versión SaaS incluye:
- 🏢 Multi-tenancy
- 💰 Planes de suscripción  
- 📊 Sistema de límites
- 📈 Analytics por tenant
- 🔧 API de gestión SaaS
EOF

    git add .
    git commit -m "feat: versión estándar e-commerce sin funcionalidades SaaS

- Removidas funcionalidades multi-tenant
- E-commerce básico single-tenant
- README actualizado para versión estándar"
    
    echo "🔄 Subiendo rama main..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Rama main subida exitosamente!"
        
        echo ""
        echo "🔄 Volviendo a rama saas-multitenant..."
        git checkout saas-multitenant
        
        echo ""
        echo "🎉 ¡REPOSITORIO CONFIGURADO EXITOSAMENTE!"
        echo ""
        echo "📍 URLs de tu repositorio:"
        echo "🌍 Repositorio: https://github.com/Archives2338/nestjs-ecommerce-saas"
        echo "🚀 Rama SaaS: https://github.com/Archives2338/nestjs-ecommerce-saas/tree/saas-multitenant"
        echo "📦 Rama Main: https://github.com/Archives2338/nestjs-ecommerce-saas/tree/main"
        echo ""
        echo "🔄 Para cambiar entre versiones:"
        echo "   Versión SaaS: git checkout saas-multitenant"
        echo "   Versión estándar: git checkout main"
        
    else
        echo "❌ Error subiendo rama main"
    fi
    
else
    echo "❌ Error subiendo rama saas-multitenant"
    echo "🔐 Asegúrate de haber configurado tu token de autenticación:"
    echo "git remote set-url origin https://Archives2338:TU_TOKEN@github.com/Archives2338/nestjs-ecommerce-saas.git"
fi
