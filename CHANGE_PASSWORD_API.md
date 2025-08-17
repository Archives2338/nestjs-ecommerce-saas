# 🔐 API de Cambio de Contraseña - MetelePlay

## Descripción General

El API de cambio de contraseña permite a los usuarios autenticados actualizar su contraseña de forma segura, proporcionando su contraseña actual y una nueva contraseña que cumple con los criterios de seguridad establecidos.

## Endpoint

```
POST /api/customer/auth/change-password
```

## Autenticación

Este endpoint requiere autenticación JWT. El token debe incluirse en el header de autorización:

```
Authorization: Bearer <jwt_token>
```

## Request Body

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `currentPassword` | string | ✅ | Contraseña actual del usuario |
| `newPassword` | string | ✅ | Nueva contraseña (debe cumplir criterios de seguridad) |

### Criterios de Validación para Nueva Contraseña

- ✅ **Mínimo 8 caracteres**
- ✅ **Máximo 50 caracteres**
- ✅ **Al menos una letra minúscula (a-z)**
- ✅ **Al menos una letra mayúscula (A-Z)**
- ✅ **Al menos un número (0-9)**
- ✅ **Caracteres especiales permitidos: @$!%*?&**
- ✅ **Debe ser diferente a la contraseña actual**

## Response Format

Todas las respuestas siguen el formato estándar:

```json
{
  "code": 0,
  "message": "string",
  "toast": 0,
  "redirect_url": "string",
  "type": "success",
  "data": null
}
```

### Codes de Response

| Code | Tipo | Descripción |
|------|------|-------------|
| `0` | Success | Operación exitosa |
| `1` | Error | Error en la operación |

## Ejemplos de Uso

### ✅ Request Exitoso

**Request:**
```bash
curl -X POST http://localhost:3000/api/customer/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "MyOldPass123",
    "newPassword": "MyNewSecure456"
  }'
```

**Response:**
```json
{
  "code": 0,
  "message": "Contraseña cambiada exitosamente",
  "toast": 0,
  "redirect_url": "",
  "type": "success",
  "data": null
}
```

### ❌ Contraseña Actual Incorrecta

**Request:**
```bash
curl -X POST http://localhost:3000/api/customer/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "WrongPassword",
    "newPassword": "MyNewSecure456"
  }'
```

**Response:**
```json
{
  "code": 1,
  "message": "La contraseña actual es incorrecta",
  "toast": 1,
  "redirect_url": "",
  "type": "error",
  "data": null
}
```

### ❌ Nueva Contraseña Muy Corta

**Request:**
```bash
curl -X POST http://localhost:3000/api/customer/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "MyOldPass123",
    "newPassword": "123"
  }'
```

**Response:**
```json
{
  "code": 1,
  "message": "Nueva contraseña debe tener al menos 8 caracteres",
  "toast": 1,
  "redirect_url": "",
  "type": "error",
  "data": null
}
```

### ❌ Nueva Contraseña No Cumple Criterios

**Request:**
```bash
curl -X POST http://localhost:3000/api/customer/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "MyOldPass123",
    "newPassword": "weakpassword"
  }'
```

**Response:**
```json
{
  "code": 1,
  "message": "Nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número",
  "toast": 1,
  "redirect_url": "",
  "type": "error",
  "data": null
}
```

### ❌ Sin Token de Autorización

**Request:**
```bash
curl -X POST http://localhost:3000/api/customer/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "MyOldPass123",
    "newPassword": "MyNewSecure456"
  }'
```

**Response:**
```json
{
  "code": 1,
  "message": "Token inválido o expirado",
  "toast": 1,
  "redirect_url": "/login",
  "type": "error",
  "data": null
}
```

## Casos de Error Comunes

### 1. Token JWT Inválido o Expirado
- **Code:** `1`
- **Message:** "Token inválido o expirado"
- **Solución:** Hacer login nuevamente para obtener un token válido

### 2. Contraseña Actual Incorrecta
- **Code:** `1`
- **Message:** "La contraseña actual es incorrecta"
- **Solución:** Verificar la contraseña actual o usar "Olvidé mi contraseña"

### 3. Nueva Contraseña Igual a la Actual
- **Code:** `1`
- **Message:** "La nueva contraseña debe ser diferente a la actual"
- **Solución:** Usar una contraseña diferente

### 4. Criterios de Contraseña No Cumplidos
- **Code:** `1`
- **Message:** Varies según el criterio no cumplido
- **Solución:** Asegurar que la nueva contraseña cumpla todos los criterios

### 5. Usuario No Encontrado o Inactivo
- **Code:** `1`
- **Message:** "Cliente no encontrado o inactivo"
- **Solución:** Verificar que la cuenta esté activa

## Funcionalidades Adicionales

### 📧 Notificación por Email

Cuando el cambio de contraseña es exitoso, se envía automáticamente un email de confirmación al usuario con:

- ✅ Confirmación del cambio exitoso
- 🕒 Fecha y hora del cambio
- 🔒 Consejos de seguridad
- ⚠️ Instrucciones si no fue autorizado
- 🔗 Enlace directo para iniciar sesión

### 🔒 Medidas de Seguridad

1. **Autenticación JWT:** Solo usuarios autenticados pueden cambiar contraseña
2. **Verificación de Contraseña Actual:** Se debe proporcionar la contraseña actual correcta
3. **Criterios Estrictos:** La nueva contraseña debe cumplir criterios de seguridad robustos
4. **Hash Seguro:** Contraseñas hasheadas con bcrypt (12 rounds)
5. **No Reutilización:** La nueva contraseña debe ser diferente a la actual
6. **Notificación de Seguridad:** Email automático para detectar cambios no autorizados

## Testing

### Script Automatizado

Ejecutar el script de pruebas completo:

```bash
./scripts/test-change-password.sh
```

### Pruebas Manuales

1. **Obtener Token JWT:**
```bash
# Login para obtener token
curl -X POST http://localhost:3000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "oldPassword123"}'
```

2. **Cambiar Contraseña:**
```bash
# Usar el token obtenido
curl -X POST http://localhost:3000/api/customer/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"currentPassword": "oldPassword123", "newPassword": "NewSecure456"}'
```

3. **Verificar Login con Nueva Contraseña:**
```bash
# Login con nueva contraseña
curl -X POST http://localhost:3000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "NewSecure456"}'
```

## Implementación Técnica

### Archivos Modificados

1. **`src/customers/dto/customer-auth.dto.ts`**
   - Definición de `ChangePasswordDto` con validaciones estrictas

2. **`src/customers/customer-auth.service.ts`**
   - Método `changePassword()` con lógica completa de validación y actualización

3. **`src/customers/customer-auth.controller.ts`**
   - Endpoint `POST /change-password` con autenticación JWT

4. **`src/email/templates/password-change.hbs`**
   - Template HTML para email de confirmación de cambio

5. **`src/email/email.service.example.ts`**
   - Método `sendPasswordChangeNotification()` para envío de emails

### Dependencias

- **bcrypt:** Para hash y comparación de contraseñas
- **class-validator:** Para validación de DTOs
- **@nestjs/jwt:** Para manejo de tokens JWT
- **@nestjs-modules/mailer:** Para envío de emails

## Consideraciones de Producción

### Variables de Entorno

```env
# Frontend URL para enlaces en emails
FRONTEND_URL=https://meteleplay.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Logs de Seguridad

El sistema registra los siguientes eventos:

- ✅ Cambios de contraseña exitosos
- ❌ Intentos fallidos de cambio
- 🔒 Tokens JWT inválidos
- 📧 Envío de notificaciones por email

### Monitoreo

Se recomienda monitorear:

- Frecuencia de cambios de contraseña por usuario
- Intentos fallidos repetitivos
- Patrones anómalos de autenticación
- Fallos en envío de emails de notificación

---

## 🎯 Conclusión

El API de cambio de contraseña implementado proporciona una solución completa y segura para que los usuarios gestionen sus credenciales, con validaciones robustas, notificaciones automáticas y medidas de seguridad apropiadas para un entorno de producción.

**Status:** ✅ **Implementado y funcional**  
**Versión:** 1.0.0  
**Última actualización:** 10 de agosto de 2025
