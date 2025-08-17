# 🔐 API de Administración - Documentación

## Resumen
Sistema completo de autenticación y gestión administrativa para el e-commerce streaming. Incluye autenticación JWT, control de permisos y gestión de contenido.

## 🚀 Características

### ✅ Autenticación Administrativa
- Login con username/password
- JWT tokens con refresh token
- Roles: `super_admin`, `admin`, `editor`
- Sistema de permisos granular
- Sesiones de 24 horas para administradores

### ✅ Gestión de Contenido
- CRUD completo de contenido multiidioma
- Filtros por idioma, categoría y estado
- Importación masiva de contenido
- Estadísticas de contenido

### ✅ Validación de Pagos
- Gestión de comprobantes pendientes
- Aprobación/rechazo de pagos
- Estadísticas de validaciones
- Re-procesamiento de credenciales

## 🔑 Administradores Predefinidos

```javascript
// Super Admin (todos los permisos)
{
  username: "admin",
  password: "password",
  email: "admin@empresa.com",
  role: "super_admin"
}

// Editor (gestión de contenido)
{
  username: "editor", 
  password: "password",
  email: "editor@empresa.com",
  role: "editor"
}

// Moderador (validación de pagos)
{
  username: "moderator",
  password: "password", 
  email: "moderator@empresa.com",
  role: "admin"
}
```

## 📡 Endpoints de la API

### 🔐 Autenticación
```bash
# Login de administrador
POST /api/admin/auth/login
Content-Type: application/json
{
  "username": "admin",
  "password": "password"
}

# Respuesta exitosa:
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@empresa.com",
      "role": "super_admin",
      "permissions": ["content:create", "content:read", ...],
      "isActive": true
    },
    "expiresIn": 86400
  }
}
```

```bash
# Renovar token
POST /api/admin/auth/refresh
Content-Type: application/json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

```bash
# Obtener perfil del admin autenticado
GET /api/admin/auth/profile
Authorization: Bearer <access_token>
```

```bash
# Logout
POST /api/admin/auth/logout
Authorization: Bearer <access_token>
```

### 📝 Gestión de Contenido
```bash
# Obtener todo el contenido con filtros
GET /api/admin/content?language=es&category=home&isActive=true
Authorization: Bearer <access_token>
```

```bash
# Crear nuevo contenido
POST /api/admin/content
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "language": "es",
  "key": "home.welcome",
  "value": "Bienvenido a nuestra plataforma",
  "category": "home",
  "description": "Mensaje de bienvenida",
  "isActive": true
}
```

```bash
# Actualizar contenido
PUT /api/admin/content/:id
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "value": "Nuevo valor actualizado",
  "description": "Descripción actualizada"
}
```

```bash
# Eliminar contenido
DELETE /api/admin/content/:id
Authorization: Bearer <access_token>
```

```bash
# Estadísticas de contenido
GET /api/admin/content/stats/summary
Authorization: Bearer <access_token>
```

```bash
# Importación masiva
POST /api/admin/content/bulk-import
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "content": [
    {
      "language": "es",
      "key": "footer.copyright",
      "value": "© 2024 Mi Empresa",
      "category": "footer"
    },
    {
      "language": "en", 
      "key": "footer.copyright",
      "value": "© 2024 My Company",
      "category": "footer"
    }
  ]
}
```

### 💳 Validación de Pagos
```bash
# Obtener pagos pendientes
GET /api/admin/payments/pending
Authorization: Bearer <access_token>
```

```bash
# Aprobar pago
PUT /api/admin/payments/:orderId/approve
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "validatorNotes": "Comprobante válido",
  "assignCredentials": true
}
```

```bash
# Rechazar pago
PUT /api/admin/payments/:orderId/reject
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "rejectionReason": "Comprobante ilegible",
  "validatorNotes": "La imagen no se puede leer correctamente"
}
```

```bash
# Estadísticas de validaciones
GET /api/admin/payments/stats
Authorization: Bearer <access_token>
```

## 🔒 Sistema de Permisos

### Permisos Disponibles:
- `content:create` - Crear contenido
- `content:read` - Leer contenido  
- `content:update` - Actualizar contenido
- `content:delete` - Eliminar contenido
- `characteristics:create` - Crear características
- `characteristics:read` - Leer características
- `characteristics:update` - Actualizar características
- `characteristics:delete` - Eliminar características
- `services:create` - Crear servicios
- `services:read` - Leer servicios
- `services:update` - Actualizar servicios
- `services:delete` - Eliminar servicios
- `payments:validate` - Validar pagos
- `payments:reject` - Rechazar pagos
- `payments:read` - Leer pagos
- `users:read` - Leer usuarios
- `users:update` - Actualizar usuarios
- `users:delete` - Eliminar usuarios
- `admin:create` - Crear administradores
- `admin:read` - Leer administradores
- `admin:update` - Actualizar administradores
- `admin:delete` - Eliminar administradores

### Roles y Permisos por Defecto:

#### Super Admin (`super_admin`)
- Todos los permisos del sistema
- Puede gestionar otros administradores

#### Admin (`admin`) 
- Gestión de pagos: `payments:validate`, `payments:reject`, `payments:read`
- Lectura de contenido: `content:read`, `content:update`
- Lectura de características y servicios

#### Editor (`editor`)
- Gestión completa de contenido: `content:*`
- Gestión de características: `characteristics:*` (excepto delete)
- Lectura y actualización de servicios

## 🧪 Pruebas

### Script de Prueba Automática
```bash
chmod +x test-admin-api.sh
./test-admin-api.sh
```

### Ejemplo de Flujo Completo
```bash
# 1. Login
curl -X POST "http://localhost:3000/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# 2. Guardar el token (reemplaza <TOKEN> con el access_token recibido)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Obtener perfil
curl -X GET "http://localhost:3000/api/admin/auth/profile" \
  -H "Authorization: Bearer $TOKEN"

# 4. Obtener contenido
curl -X GET "http://localhost:3000/api/admin/content" \
  -H "Authorization: Bearer $TOKEN"

# 5. Crear contenido
curl -X POST "http://localhost:3000/api/admin/content" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "es",
    "key": "test.message", 
    "value": "Mensaje de prueba",
    "category": "test"
  }'

# 6. Obtener estadísticas
curl -X GET "http://localhost:3000/api/admin/content/stats/summary" \
  -H "Authorization: Bearer $TOKEN"
```

## 🚨 Errores Comunes

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token de administrador inválido o expirado",
  "error": "UNAUTHORIZED_ADMIN"
}
```
**Solución**: Verificar que el token sea válido y no haya expirado.

### 403 Forbidden  
```json
{
  "success": false,
  "message": "No tienes permisos suficientes para realizar esta acción",
  "error": "INSUFFICIENT_PERMISSIONS",
  "requiredPermissions": ["content:create"]
}
```
**Solución**: El usuario necesita los permisos listados en `requiredPermissions`.

### 409 Conflict
```json
{
  "success": false,
  "message": "Ya existe contenido con esta clave para este idioma", 
  "error": "CONTENT_ALREADY_EXISTS"
}
```
**Solución**: Usar una clave diferente o actualizar el contenido existente.

## 🔧 Configuración

### Variables de Entorno
```bash
# JWT Secret para administradores (cambiar en producción)
ADMIN_JWT_SECRET=admin-super-secret-key

# Puerto del servidor
PORT=3000
```

### Integración con Frontend
El frontend Angular puede usar esta API enviando el token en el header:
```typescript
const headers = {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
};
```

## 🎯 Próximas Mejoras
- [ ] Integración con base de datos real (MongoDB)
- [ ] Sistema de logs de auditoría
- [ ] Notificaciones en tiempo real
- [ ] API para gestión de usuarios finales
- [ ] Dashboard con métricas en tiempo real
- [ ] Exportación de reportes
- [ ] Configuración de roles personalizada
