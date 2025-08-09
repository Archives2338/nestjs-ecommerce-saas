# Sistema de Gestión de Órdenes

## 📋 Descripción General

Sistema completo de gestión de órdenes para e-commerce de streaming services con soporte para historial real, verificación de pagos y análisis OCR.

## 🏗️ Arquitectura

### Componentes Principales

1. **Order Schema** (`orders/schemas/order.schema.ts`)
   - Esquema MongoDB con todos los campos requeridos para historial
   - Compatibilidad total con mock data existente
   - Timestamps automáticos y getters calculados

2. **Orders Service** (`orders/orders.service.ts`)
   - Métodos CRUD completos para órdenes
   - Integración con OCR para verificación de comprobantes
   - Estadísticas y filtros avanzados

3. **Orders Controller** (`orders/orders.controller.ts`)
   - API REST completa con endpoints estandardizados
   - Manejo de archivos para comprobantes
   - Validación de datos con DTOs

4. **Customer Auth Integration** (`customers/customer-auth.service.ts`)
   - Reemplazo de datos mock con queries reales
   - Formato compatible con frontend existente

## 📊 Campos del Schema

### Campos Básicos
- `customer`: Referencia al cliente
- `items`: Array de productos en la orden
- `total`: Total de la orden
- `paymentMethod`: Método de pago (yape, plin, transferencia)

### Campos de Historial (Compatible con Mock)
- `out_trade_no`: Número único de orden (14 dígitos)
- `type_id`: ID del tipo de servicio
- `type_plan_id`: ID del plan específico
- `ostatus`: Estado de la orden (1=pendiente, 2=pagado, 3=verificando, 5=cancelado)
- `payment_id`: ID del método de pago
- `service_start_time`: Fecha de inicio del servicio
- `service_end_time`: Fecha de fin del servicio
- `currency`: Moneda (PEN/USD)
- `total_price`: Precio total como string
- `original_price`: Precio original

### Campos de Verificación
- `comprobanteUrl`: URL del comprobante subido
- `comprobanteOcrText`: Texto extraído por OCR
- `paymentReference`: Referencia del pago
- `paymentAmount`: Monto del pago

## 🔧 API Endpoints

### Gestión de Órdenes

```bash
# Crear orden
POST /api/orders
{
  "serviceId": "string",
  "items": [{ "productId": "string", "name": "string", "quantity": 1, "price": 17.00 }],
  "total": 17.00,
  "paymentMethod": "yape",
  "type_plan_id": 1
}

# Obtener orden por ID
GET /api/orders/:id

# Buscar orden por número
GET /api/orders/trade-no/:tradeNo

# Actualizar estado
PUT /api/orders/:id/status
{ "status": "pagado" }

# Adjuntar comprobante
PUT /api/orders/:id/comprobante
Content-Type: multipart/form-data
file: [archivo imagen]
comprobanteUrl: string
paymentReference: string
paymentAmount: number
```

### Historial de Cliente

```bash
# Historial con filtros
GET /api/orders/customer/:customerId/history?page=1&limit=10&order_status=2

# Estadísticas por estado
GET /api/orders/customer/:customerId/statistics

# Tipos de servicios del usuario
GET /api/orders/customer/:customerId/service-types
```

### Customer Auth (Historial Legacy)

```bash
# Historial compatible con mock anterior
POST /api/customer-auth/order-history
{
  "customer_id": "string",
  "page": 1,
  "limit": 10,
  "language": "es"
}
```

## 🎯 Estados de Órdenes

| Estado | Código | Descripción |
|--------|--------|-------------|
| Pendiente | 1 | Orden creada, esperando pago |
| Pagado | 2 | Pago confirmado, servicio activo |
| Verificando | 3 | Comprobante recibido, verificación manual |
| Cancelado | 5 | Orden cancelada |

## 💳 Métodos de Pago

| Método | ID | Descripción |
|--------|----|-----------| 
| Yape | 1 | Pago móvil Yape |
| Plin | 2 | Pago móvil Plin |
| Transferencia | 3 | Transferencia bancaria |

## 🛠️ Scripts de Desarrollo

### Seeding de Datos
```bash
# Compilar y crear órdenes de ejemplo
./scripts/seed-orders.sh

# O manualmente:
npm run build
node dist/scripts/seed-orders.js
```

### Pruebas API
```bash
# Probar todos los endpoints
./scripts/test-orders.sh
```

## 🔍 Verificación OCR

El sistema incluye análisis OCR automático para verificar comprobantes de pago:

1. **Subida de Archivo**: Cliente adjunta imagen del comprobante
2. **Extracción OCR**: Tesseract.js extrae texto de la imagen
3. **Almacenamiento**: Texto OCR se guarda en `comprobanteOcrText`
4. **Validación Manual**: Admin puede revisar coincidencias

### Configuración OCR

```typescript
// ocr.service.ts - Configuración actual
const worker = await createWorker('spa', OEM.LSTM_ONLY, {
  logger: m => console.log(m)
});
```

## 🔐 Validación Administrativa

**NUEVO**: Sistema completo de validación administrativa para comprobantes de pago.

### API de Administración
```bash
# Comprobantes pendientes de validación
GET /api/admin/payments/pending

# Aprobar comprobante y asignar credenciales automáticamente
PUT /api/admin/payments/:orderId/approve
{
  "adminNotes": "Comprobante validado correctamente",
  "autoAssignCredentials": true
}

# Rechazar comprobante
PUT /api/admin/payments/:orderId/reject
{
  "rejectionReason": "Comprobante ilegible"
}

# Estadísticas de validaciones
GET /api/admin/payments/stats
```

### Flujo de Validación
1. Cliente envía comprobante → Estado "verificando" (ostatus: 3)
2. Admin ve comprobantes pendientes
3. Admin aprueba/rechaza comprobante
4. **Sistema asigna credenciales automáticamente**
5. Cliente recibe email con acceso (TODO)

Ver documentación completa: [ADMIN_PAYMENT_VALIDATION_SYSTEM.md](./ADMIN_PAYMENT_VALIDATION_SYSTEM.md)

## 📈 Machine Learning (Futuro)

Sistema preparado para integrar ML de detección de fraude:

- **Local Training**: Entrenamiento en servidor propio
- **Cloud APIs**: Google Vision, AWS Textract como fallback
- **Validación Cruzada**: Comparar múltiples fuentes
- **Scoring de Confianza**: Puntuación automática de autenticidad

## 🔄 Migración desde Mock

### Proceso de Transición

1. ✅ **Schema Extendido**: Todos los campos mock ahora en BD real
2. ✅ **Service Actualizado**: Métodos reales reemplazan mock data
3. ✅ **Formato Compatible**: Respuestas mantienen estructura esperada
4. ✅ **Fallback Seguro**: Mock data como respaldo en errores

### Compatibilidad

El sistema mantiene 100% compatibilidad con el frontend existente:
- Mismos nombres de campos
- Misma estructura de respuesta
- Mismos códigos de estado
- Misma paginación

## 📋 Ejemplos de Uso

### Crear Orden Netflix
```json
{
  "serviceId": "673a5299e2f1234567890111",
  "items": [{
    "productId": "netflix-1-profile",
    "name": "Netflix 1 Perfil",
    "quantity": 1,
    "price": 17.00,
    "duration": "1 mes",
    "profiles": 1
  }],
  "total": 17.00,
  "paymentMethod": "yape",
  "type_plan_id": 1,
  "promo_code": ""
}
```

### Filtrar Historial
```bash
GET /api/orders/customer/123/history?order_status=2&start_time=2024-01-01&end_time=2024-12-31
```

### Respuesta de Historial
```json
{
  "code": 0,
  "message": "Listo",
  "data": {
    "total": 15,
    "list": [...],
    "type": [{"type_id": 1, "type_name": "Netflix"}],
    "statistic": [{"order_status": 2, "count": 10}]
  }
}
```

## 🚀 Próximos Pasos

1. **Integración ML**: Implementar detección automática de fraude
2. **Webhooks**: Notificaciones automáticas de cambio de estado
3. **Reportes**: Dashboard de analytics para administradores
4. **Automatización**: Auto-confirmación de pagos Yape/Plin
5. **Multi-moneda**: Soporte completo USD/PEN con tasas dinámicas

---

**Desarrollado para**: E-commerce de Streaming Services  
**Tecnologías**: NestJS, MongoDB, Mongoose, OCR, TypeScript  
**Estado**: ✅ Producción Ready
