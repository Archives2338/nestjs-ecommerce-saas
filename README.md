# NestJS E-commerce SaaS Backend

Backend SaaS especializado en **venta y gestión de cuentas de servicios de streaming** (Netflix, Spotify, YouTube Premium, etc.) construido con NestJS, MongoDB y JWT.

## 🎯 **Estado Actual - Fase 1 Completada ✅**

Sistema **funcionando y listo para producción** con API compatible al 100% con referencias externas.

## 🚀 Características Implementadas

- ✅ **API getSkuList**: Endpoint compatible con API de referencia externa
- ✅ **Gestión de Servicios**: Netflix completo con planes y precios dinámicos
- ✅ **Validación Robusta**: DTOs con validación completa de datos
- ✅ **Base de datos MongoDB**: Schemas optimizados para servicios de streaming
- ✅ **Seed Scripts**: Datos de Netflix listos para usar
- ✅ **Logging estructurado**: Monitoreo completo de requests y errores
- ✅ **Autenticación JWT**: Sistema de auth preparado
- ✅ **Sistema multi-idioma**: Soporte para español e inglés

## 📋 **Roadmap Evolutivo**

- 📖 **[Ver Roadmap Completo](./ROADMAP.md)** - Plan detallado de mejoras futuras
- 🔄 **Fase 2**: Arquitectura dinámica con `month_id` y `screen_id`
- 🔐 **Fase 3**: Gestión avanzada de inventario de cuentas
- 🎨 **Fase 4**: Panel de administración web

## 📦 Instalación

```bash
# Instalar dependencias
npm install
```

## 🔧 Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Email (opcional)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# Puerto
PORT=3000
```

## 🚀 Ejecutar la Aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Build
npm run build

# Poblar datos de ejemplo (Netflix)
npm run seed:services
```

## 🧪 **Probar la API Actual**

### 🎬 **Netflix getSkuList API** (Principal)
```bash
curl -X POST http://localhost:3000/api/index/getSkuList \
  -H "Content-Type: application/json" \
  -d '{
    "language": "es",
    "type_id": 1,
    "source": 1
  }'
```

**Respuesta esperada**: Netflix con todos los planes, precios y opciones de pantalla

### ✅ **Health Check**
```bash
curl http://localhost:3000/
```

## 📚 API Endpoints

### 🎯 **Servicios de Streaming (Principal)**
- `POST /api/index/getSkuList` - **API PRINCIPAL** - Obtener detalles de servicio con planes y precios
- `GET /api/services/:language` - Listar todos los servicios
- `POST /api/services` - Crear nuevo servicio
- `PUT /api/services/:language/:id` - Actualizar servicio
- `DELETE /api/services/:language/:id` - Eliminar servicio

### 🔐 **Autenticación**
- `POST /authorize/sign_process` - Login de usuario
- `POST /authorize/code_sign` - Verificación de código

### 📦 **Catálogo y Configuración**
- `POST /index/getTypeClassifyList` - Obtener catálogo de productos
- `POST /index/siteConfig` - Obtener configuración del sitio
- `PUT /index/siteConfig/:language` - Actualizar configuración

### 📄 **Gestión de Contenido**
- `GET /api/webpage/:language` - Obtener contenido de página
- `PUT /api/webpage/:language/:section` - Actualizar sección
- `GET /api/webpage/languages` - Idiomas disponibles

## 🌟 Versión SaaS Multi-Tenant

¿Necesitas una solución SaaS para múltiples clientes? Cambia a la rama SaaS:

```bash
git checkout saas-multitenant
npm install
npm run start:dev
```

### La versión SaaS incluye:
- 🏢 **Multi-tenancy**: Aislamiento completo de datos por cliente
- 💰 **Planes de suscripción**: Starter, Professional, Enterprise  
- 📊 **Sistema de límites**: Control automático por plan
- 📈 **Analytics por tenant**: Métricas y reportes individuales
- 🔧 **API de gestión SaaS**: CRUD completo de tenants
- 💳 **Sistema de facturación**: Integración con Stripe
- 🎨 **White-label**: Branding personalizado por cliente

### Potencial de negocio SaaS:
- **Año 1**: $70K ARR con 100 clientes
- **Año 2**: $462K ARR con 500 clientes
- **Año 3**: $1.8M+ ARR con 1,500+ clientes

---

⭐ **¡Dale una estrella al proyecto si te fue útil!**