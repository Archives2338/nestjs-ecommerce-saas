# 🔐 API de Olvido de Contraseña - MetelePlay

## Resumen de funcionalidad implementada

✅ **ESTADO:** Completamente implementado y funcional
✅ **EMAIL:** Integrado con MailerService y Gmail SMTP
✅ **TEMPLATES:** Template `forget-password.hbs` con branding MetelePlay
✅ **SEGURIDAD:** Tokens seguros con expiración de 1 hora

---

## 📋 **Endpoints disponibles**

### **1. Solicitar reset de contraseña**
```http
POST /api/customer/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta exitosa:**
```json
{
  "code": 0,
  "message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
  "toast": 0,
  "redirect_url": "",
  "type": "success",
  "data": null
}
```

### **2. Restablecer contraseña**
```http
POST /api/customer/auth/reset-password
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6...", 
  "newPassword": "nuevaPassword123!"
}
```

**Respuesta exitosa:**
```json
{
  "code": 0,
  "message": "Contraseña restablecida exitosamente",
  "toast": 0,
  "redirect_url": "/login",
  "type": "success",
  "data": null
}
```

---

## 🔄 **Flujo completo**

### **Paso 1: Usuario solicita reset**
```bash
curl -X POST http://localhost:3000/api/customer/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com"}'
```

### **Paso 2: Sistema procesa la solicitud**
1. ✅ Busca el usuario por email
2. ✅ Genera token seguro de 32 bytes
3. ✅ Guarda token en BD con expiración (1 hora)
4. ✅ Envía email con template `forget-password.hbs`
5. ✅ Responde siempre éxito (por seguridad)

### **Paso 3: Usuario recibe email**
📧 **Email contiene:**
- 🔑 Código de recuperación 
- 🔗 Enlace directo: `/reset-password?token=...&email=...`
- ⏰ Aviso de expiración (15 minutos)
- 🛡️ Instrucciones de seguridad

### **Paso 4: Usuario usa el enlace**
```bash
curl -X POST http://localhost:3000/api/customer/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "newPassword": "nuevaPassword123!"
  }'
```

### **Paso 5: Sistema valida y actualiza**
1. ✅ Verifica token válido y no expirado
2. ✅ Hashea nueva contraseña (bcrypt)
3. ✅ Actualiza contraseña en BD
4. ✅ Elimina token de reset
5. ✅ Confirma éxito

---

## 🧪 **Endpoints de testing**

### **Test básico de email:**
```bash
curl -X POST http://localhost:3000/test/email/password-recovery \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "userName": "Usuario Prueba"
  }'
```

### **Test de flujo completo:**
```bash
curl -X POST http://localhost:3000/test/email/test-forgot-password-flow \
  -H "Content-Type: application/json" \
  -d '{"email": "test@ejemplo.com"}'
```

---

## 🔒 **Seguridad implementada**

### **Protecciones:**
- ✅ **Tokens seguros:** 32 bytes crypto.randomBytes
- ✅ **Expiración:** 1 hora desde solicitud
- ✅ **Rate limiting:** Respuesta siempre igual (por seguridad)
- ✅ **Validación:** Email debe existir y estar activo
- ✅ **Hash seguro:** bcrypt con 12 rounds
- ✅ **Cleanup:** Tokens se eliminan después del uso

### **Validaciones:**
- ✅ Email válido y existente
- ✅ Token no expirado
- ✅ Contraseña cumple criterios:
  - Mínimo 8 caracteres
  - Máximo 50 caracteres
  - Al menos 1 mayúscula, 1 minúscula, 1 número, 1 especial

---

## 🎨 **Template de email**

**Archivo:** `src/email/templates/forget-password.hbs`

**Características:**
- 🎨 Diseño responsivo y profesional
- 🏷️ Branding MetelePlay consistente
- 🔐 Código de recuperación destacado
- ⚠️ Instrucciones de seguridad claras
- 📱 Compatible con móviles

---

## 📊 **Esquema de BD**

```typescript
// customer.schema.ts
export class Customer {
  // ... otros campos
  passwordResetToken?: string;     // Token de reset
  passwordResetExpires?: Date;     // Fecha de expiración
}

// Índices:
CustomerSchema.index({ passwordResetToken: 1 });
```

---

## 🚀 **Cómo usar en producción**

### **1. Configurar variables de entorno:**
```env
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=meteleplay.pe@gmail.com
SMTP_PASS=tu_app_password_aqui
FRONTEND_URL=https://meteleplay.com
```

### **2. Frontend debe implementar:**
```javascript
// Solicitar reset
const forgotPassword = async (email) => {
  const response = await fetch('/api/customer/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Restablecer contraseña
const resetPassword = async (token, newPassword) => {
  const response = await fetch('/api/customer/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return response.json();
};
```

### **3. Páginas necesarias en frontend:**
- 📄 `/forgot-password` - Formulario para solicitar reset
- 📄 `/reset-password` - Formulario para nueva contraseña (recibe token)

---

## ✅ **Estado actual**

🎯 **COMPLETAMENTE FUNCIONAL**
- ✅ Endpoints implementados
- ✅ Email integration con MailerService
- ✅ Templates diseñados 
- ✅ Validaciones de seguridad
- ✅ Tests disponibles
- ✅ Documentación completa

**¡Todo listo para usar en producción!** 🚀
