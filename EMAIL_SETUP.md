# 📧 Configuración del Sistema de Email - GamsGo

## 🎯 Resumen del Sistema

Se ha implementado un sistema completo de email con **GamsGoEmailService** que incluye:

- ✅ **Emails de verificación** con código de 4 dígitos
- ✅ **Emails de bienvenida** con datos del servicio
- ✅ **Emails de credenciales** con acceso a cuentas
- ✅ **Templates con branding GamsGo**
- ✅ **Modo desarrollo** que muestra emails en consola

## 🛠️ Configuración SMTP

### Opción 1: Gmail App Password (Recomendado)

1. **Activar 2FA en Gmail:**
   ```
   Configuración → Seguridad → Verificación en 2 pasos
   ```

2. **Generar App Password:**
   ```
   Configuración → Seguridad → Contraseñas de aplicaciones
   Seleccionar "Correo" → Copiar la contraseña de 16 dígitos
   ```

3. **Variables de entorno (.env):**
   ```bash
   # Gmail SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # App Password de 16 dígitos
   
   # Información del remitente
   FROM_EMAIL=noreply@gamsgo.com
   APP_NAME=GamsGo
   ```

### Opción 2: SendGrid (Para producción)

1. **Crear cuenta en SendGrid**
2. **Generar API Key**
3. **Variables de entorno:**
   ```bash
   # SendGrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # Información del remitente
   FROM_EMAIL=noreply@gamsgo.com
   APP_NAME=GamsGo
   ```

## 🧪 Modo Desarrollo

**Sin SMTP configurado**, el sistema automáticamente:
- 📝 Imprime los emails en la consola
- ✅ Retorna `true` (éxito simulado)
- 🔧 Muestra todos los datos del email
- 💡 Da instrucciones para configurar SMTP

**Ejemplo de salida en desarrollo:**
```
📧 [DEV MODE] Email de verificación para user@email.com:
👤 Usuario: Juan Pérez
🔢 Código: 4829
🔗 URL: http://localhost:3000/verify?code=4829
⏰ Expira en: 10 minutos
💡 Configura SMTP_USER y SMTP_PASS para envío real
```

## 🔄 Integración Actual

El sistema está integrado en:

1. **Registro de cliente** (`customer-auth.service.ts`):
   ```typescript
   // Paso 2: Envío del código de verificación
   await this.emailService.sendVerificationEmail(email, {
     userName: `${firstName} ${lastName}`,
     verificationCode: verificationCode,
     verificationUrl: `${process.env.FRONTEND_URL}/verify?code=${verificationCode}`,
     expiresIn: '10 minutos'
   });
   ```

2. **Activación de cuenta**:
   ```typescript
   // Paso 4: Email de bienvenida
   await this.emailService.sendWelcomeEmail(customerEmail, {
     userName: customer.firstName,
     serviceName: 'Servicio Premium',
     planName: 'Plan Básico'
   });
   ```

## 🚀 Próximos Pasos

1. **Configurar SMTP:**
   - Añadir variables de entorno según la opción elegida
   - Reiniciar la aplicación

2. **Probar el sistema:**
   ```bash
   # Probar registro de cliente
   curl -X POST http://localhost:3000/customer-auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "firstName": "Test",
       "lastName": "User",
       "phone": "+1234567890",
       "password": "password123"
     }'
   ```

3. **Verificar logs:**
   - En desarrollo: Ver emails en consola
   - En producción: Ver confirmaciones de envío

## ⚡ Estados del Sistema

| Estado | SMTP_USER | SMTP_PASS | Comportamiento |
|--------|-----------|-----------|----------------|
| 🟢 **Producción** | ✅ | ✅ | Envío real de emails |
| 🟡 **Desarrollo** | ❌ | ❌ | Emails en consola |
| 🔴 **Error** | ✅ | ❌ | Falla + logs de error |

## 🎨 Templates Disponibles

### 1. Email de Verificación
- **Uso:** Confirmar registro
- **Incluye:** Código de 4 dígitos, URL de verificación
- **Expira:** 10 minutos

### 2. Email de Bienvenida  
- **Uso:** Después de verificar cuenta
- **Incluye:** Datos del servicio contratado
- **Opcional:** Credenciales de cuenta

### 3. Email de Credenciales
- **Uso:** Envío de accesos a servicios
- **Incluye:** Email y password de la cuenta
- **Seguridad:** Avisos de seguridad incluidos

## 🔧 Solución de Problemas

### Error: "Missing credentials for PLAIN"
```bash
# Verificar variables de entorno
echo $SMTP_USER
echo $SMTP_PASS

# Restart la aplicación después de configurar
npm run start:dev
```

### Error: "Invalid login"
- Verificar que el App Password esté correcto
- Confirmar que 2FA esté activado en Gmail
- Revisar que el usuario sea correcto

### No se envían emails
- Verificar logs en consola
- Confirmar configuración de puerto (587 para Gmail)
- Revistar configuración `SMTP_SECURE=false` para puerto 587

## 📞 Soporte

Si necesitas ayuda adicional:
1. Revisa los logs del servicio de email
2. Verifica la configuración de variables de entorno  
3. Prueba primero en modo desarrollo (sin SMTP)
