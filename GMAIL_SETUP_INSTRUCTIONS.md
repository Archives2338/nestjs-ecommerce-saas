# INSTRUCCIONES PARA CONFIGURAR GMAIL SMTP

## Opción 1: App Password (Recomendado para desarrollo)

1. Ve a: https://myaccount.google.com/security
2. Activa la verificación en 2 pasos si no está activada
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Mail" o "Otra (personalizada): NestJS Backend"
5. Copia la contraseña de 16 caracteres (sin espacios)
6. Reemplaza NUEVA_APP_PASSWORD_AQUI en el archivo .env

## Opción 2: Configuración alternativa (si App Password no funciona)

Puedes probar con estas configuraciones en .env:

```
# Alternativa 1: Gmail con TLS más permisivo
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=meteleplay.pe@gmail.com
SMTP_PASS=tu_app_password_aqui

# Alternativa 2: Gmail con SSL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=meteleplay.pe@gmail.com
SMTP_PASS=tu_app_password_aqui
```

## Verificaciones importantes:

1. ✅ Verificación en 2 pasos ACTIVADA
2. ✅ App Password generada específicamente para esta app
3. ✅ Email correcto: meteleplay.pe@gmail.com
4. ✅ Contraseña sin espacios ni caracteres especiales

## Errores comunes:

- 535-5.7.8: Credenciales incorrectas → Regenerar App Password
- 534-5.7.9: App Password deshabilitada → Verificar 2FA
- 534-5.7.14: Demasiados intentos → Esperar 15 minutos

## Test después de configurar:

```bash
curl -X POST http://localhost:3000/test/email/simple-test \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@ejemplo.com"}'
```
