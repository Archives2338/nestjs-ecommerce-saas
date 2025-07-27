# NestJS E-commerce Backend

E-commerce backend básico construido con NestJS, MongoDB y JWT.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Gestión de catálogo de productos
- ✅ Sistema de configuración del sitio
- ✅ API REST completa
- ✅ Base de datos MongoDB
- ✅ Validación de datos con DTOs
- ✅ Logging estructurado
- ✅ Email service para notificaciones

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
```

## 📚 API Endpoints

### Salud del Sistema
- `GET /` - Health check

### Autenticación
- `POST /authorize/sign_process` - Login de usuario
- `POST /authorize/code_sign` - Verificación de código

### Catálogo de Productos
- `POST /index/getTypeClassifyList` - Obtener catálogo de productos
- `PUT /index/catalog/:language` - Actualizar catálogo
- `POST /index/addRecentOrder/:productId` - Agregar orden reciente

### Configuración del Sitio
- `POST /index/siteConfig` - Obtener configuración del sitio
- `PUT /index/siteConfig/:language` - Actualizar configuración

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