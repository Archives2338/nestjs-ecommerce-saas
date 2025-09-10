# 📤 Sistema de Carga de Archivos S3 - Documentación

## 🎯 Descripción General

El sistema de carga de archivos S3 está completamente implementado y listo para usar en tu aplicación NestJS. Permite subir, descargar, generar URLs firmadas y eliminar archivos de manera segura usando Amazon S3.

## 🔧 Configuración

### Variables de Entorno (.env)
```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_S3_REGION=us-east-2
AWS_S3_BUCKET=your_bucket_name_here
```

### Dependencias Instaladas
- `aws-sdk` - SDK principal de AWS
- `@aws-sdk/client-s3` - Cliente S3 v3
- `@aws-sdk/s3-request-presigner` - Para URLs firmadas
- `multer` - Para manejo de archivos multipart
- `uuid` - Para generar nombres únicos

## 🚀 Endpoints Disponibles

### 1. 📤 Subir Archivo Único
```bash
POST /api/files/upload
Content-Type: multipart/form-data

Body:
- file: [archivo]
- folder: [carpeta opcional]
```

**Ejemplo con curl:**
```bash
curl -X POST "http://localhost:3000/api/files/upload" \
  -F "file=@documento.pdf" \
  -F "folder=documentos"
```

**Respuesta:**
```json
{
  "code": 0,
  "message": "Archivo subido exitosamente",
  "data": {
    "url": "https://mybucketimperio.s3.us-east-2.amazonaws.com/documentos/abc123.pdf",
    "key": "documentos/abc123.pdf",
    "originalName": "documento.pdf",
    "size": 1024,
    "mimetype": "application/pdf"
  }
}
```

### 2. 🖼️ Subir Avatar
```bash
POST /api/files/upload-avatar
Content-Type: multipart/form-data

Body:
- avatar: [imagen]
```

**Validaciones específicas:**
- Solo imágenes: JPEG, PNG, WebP
- Tamaño máximo: 5MB
- Se guarda en carpeta `avatars/`

### 3. 📦 Subir Múltiples Archivos
```bash
POST /api/files/upload-multiple
Content-Type: multipart/form-data

Body:
- files: [archivo1]
- files: [archivo2]
- folder: [carpeta opcional]
```

**Ejemplo:**
```bash
curl -X POST "http://localhost:3000/api/files/upload-multiple" \
  -F "files=@imagen1.jpg" \
  -F "files=@imagen2.png" \
  -F "folder=galeria"
```

### 4. 🔗 Generar URL Firmada
```bash
GET /api/files/signed-url/{key}?expires=3600
```

**Ejemplo:**
```bash
curl "http://localhost:3000/api/files/signed-url/documentos/abc123.pdf?expires=1800"
```

### 5. 🗑️ Eliminar Archivo
```bash
DELETE /api/files/{key}
```

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:3000/api/files/documentos/abc123.pdf"
```

## 🛡️ Validaciones de Seguridad

### Tipos de Archivo Permitidos
- **Imágenes:** JPEG, PNG, GIF, WebP
- **Documentos:** PDF, TXT, DOC, DOCX
- **Avatares:** Solo JPEG, PNG, WebP

### Límites de Tamaño
- **Archivos generales:** Máximo 10MB
- **Avatares:** Máximo 5MB
- **Múltiples archivos:** Máximo 10 archivos por request

## 🔌 Integración con Servicios Existentes

### Ejemplo: Orders con S3
```typescript
// En OrdersModule, importar FilesModule
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  // ...
})
export class OrdersModule {}

// En OrdersService, inyectar S3Service
constructor(
  private readonly s3Service: S3Service
) {}

// Usar en endpoint de comprobantes
async uploadPaymentReceipt(file: Express.Multer.File, orderId: string) {
  const result = await this.s3Service.uploadFile(file, `payment-receipts/${orderId}`);
  return result;
}
```

### Ejemplo: Customer con Avatar
```typescript
@Post('upload-avatar')
@UseInterceptors(FileInterceptor('avatar'))
async uploadAvatar(
  @UploadedFile() file: Express.Multer.File,
  @CurrentUser() user: any
) {
  const result = await this.s3Service.uploadFile(file, `avatars/${user.id}`);
  
  // Actualizar URL del avatar en la base de datos
  await this.userService.updateAvatar(user.id, result.url);
  
  return { avatarUrl: result.url };
}
```

## 🧪 Pruebas

### Ejecutar Script de Pruebas
```bash
./test-s3-upload.sh
```

Este script prueba:
- ✅ Subida de archivo único
- ✅ Generación de URL firmada
- ✅ Subida de avatar
- ✅ Eliminación de archivo
- ✅ Subida múltiple

### Verificar en AWS Console
1. Ve a AWS S3 Console
2. Busca el bucket `mybucketimperio`
3. Verifica las carpetas creadas:
   - `test-uploads/`
   - `avatars/`
   - `multiple-test/`
   - `payment-receipts/`

## 📁 Estructura de Carpetas en S3

```
mybucketimperio/
├── avatars/              # Imágenes de perfil
├── payment-receipts/     # Comprobantes de pago
├── account-verification/ # Documentos de verificación
├── general/              # Archivos generales
├── test-uploads/         # Archivos de prueba
└── multiple-test/        # Pruebas múltiples
```

## 🔒 Seguridad y Mejores Prácticas

### URLs Públicas vs Firmadas
- **Públicas:** Para avatares y recursos que no requieren autenticación
- **Firmadas:** Para documentos privados, comprobantes, etc.

### Organización por Usuario
```typescript
// Estructura recomendada
const folder = `user-documents/${userId}/${documentType}`;
const result = await s3Service.uploadFile(file, folder);
```

### Validación de Acceso
```typescript
// Verificar que el usuario puede acceder al archivo
if (!key.includes(`user-documents/${userId}`)) {
  throw new ForbiddenException('Acceso denegado');
}
```

## 🚨 Solución de Problemas

### Error: Credenciales AWS
- Verifica que las variables de entorno estén configuradas
- Confirma que las credenciales tengan permisos S3

### Error: Bucket no existe
- Crea el bucket `mybucketimperio` en AWS Console
- Configura las políticas de acceso público si es necesario

### Error: Archivo muy grande
- Verifica los límites de tamaño en el código
- Ajusta según tus necesidades

## 🎉 ¡Sistema Listo!

El sistema de carga de archivos S3 está completamente funcional y listo para uso en producción. Puedes:

1. ✅ Subir archivos únicos y múltiples
2. ✅ Generar URLs firmadas para acceso seguro
3. ✅ Eliminar archivos cuando sea necesario
4. ✅ Integrar con cualquier módulo existente
5. ✅ Organizar archivos por carpetas y usuarios

**Próximos pasos sugeridos:**
- Implementar en el módulo de Orders para comprobantes
- Agregar a Customer para avatares
- Crear endpoints de administración para gestión de archivos
