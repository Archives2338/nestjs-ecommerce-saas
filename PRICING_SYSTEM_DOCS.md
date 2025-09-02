# Sistema de Pricing Modular - Documentación Técnica

## 📋 Resumen General

Sistema modular de pricing para servicios de streaming que permite configurar dinámicamente opciones de duración (meses), cantidad de pantallas/perfiles y precios asociados. Implementado en NestJS con MongoDB.

## 🏗️ Arquitectura del Sistema

### Entidades Principales

#### 1. **ServiceMonthOption** (Opciones de Duración)
- **Propósito**: Define las opciones de duración disponibles para un servicio
- **Ubicación**: `src/services/schemas-new/service-month-option.schema.ts`
- **Campos principales**:
  - `month_id`: ID único autogenerado (number)
  - `serviceId`: Referencia al servicio principal (ObjectId)
  - `month`: Duración en meses (1, 3, 6, 12)
  - `month_content`: Descripción ("1 mes", "3 meses")
  - `is_default`: Si es la opción por defecto
  - `active`: Estado activo/inactivo

#### 2. **ServiceScreenOption** (Opciones de Pantallas/Perfiles)
- **Propósito**: Define las opciones de pantallas/perfiles disponibles
- **Ubicación**: `src/services/schemas-new/service-screen-option.schema.ts`
- **Campos principales**:
  - `screen_id`: ID único autogenerado (number)
  - `serviceId`: Referencia al servicio principal (ObjectId)
  - `screen`: Número de pantallas/perfiles (1, 2, 4)
  - `screen_content`: Descripción ("1 perfil", "2 pantallas")
  - `max_user`: Usuarios máximos permitidos
  - `seat_type`: Tipo de asiento ("Individual", "Familiar", "Premium")
  - `is_default`: Si es la opción por defecto
  - `active`: Estado activo/inactivo

#### 3. **ServicePlan** (Planes de Precios)
- **Propósito**: Matriz de precios combinando duración + pantallas
- **Ubicación**: `src/services/schemas-new/service-plan.schema.ts`
- **Campos principales**:
  - `type_plan_id`: ID único autogenerado (number)
  - `serviceId`: Referencia al servicio principal (ObjectId)
  - `month_id`: Referencia a ServiceMonthOption.month_id
  - `screen_id`: Referencia a ServiceScreenOption.screen_id
  - `plan_type`: Tipo de plan ('plan' | 'repayment')
  - `original_price`: Precio original
  - `sale_price`: Precio de venta
  - `discount`: Porcentaje de descuento
  - `currency_icon1`: Símbolo de moneda ("S/")
  - `currency_icon2`: Código de moneda ("PEN")
  - `active`: Estado activo/inactivo

## 🔗 Relaciones entre Entidades

### Diagrama de Relaciones
```
Service (Principal)
    │
    ├── ServiceMonthOption (1:N)
    │   └── month_id (PK)
    │
    ├── ServiceScreenOption (1:N)
    │   └── screen_id (PK)
    │
    └── ServicePlan (N:M) - Tabla Pivot
        ├── month_id (FK → ServiceMonthOption.month_id)
        ├── screen_id (FK → ServiceScreenOption.screen_id)
        └── serviceId (FK → Service._id)
```

### Tipos de Claves
- **ObjectId**: Solo para `serviceId` (relación con Service principal)
- **Numbers**: Para `month_id`, `screen_id`, `type_plan_id` (autogenerados secuencialmente)

## 🛠️ Servicios y Controladores

### Servicios Implementados

#### 1. ServiceMonthOptionService
- **Ubicación**: `src/services/services/service-month-option.service.ts`
- **Funcionalidades**:
  - ✅ Generación automática de `month_id`
  - ✅ CRUD completo con validaciones
  - ✅ Prevención de duplicados por servicio
  - ✅ Gestión de opciones por defecto

#### 2. ServiceScreenOptionService
- **Ubicación**: `src/services/services/service-screen-option.service.ts`
- **Funcionalidades**:
  - ✅ Generación automática de `screen_id`
  - ✅ CRUD completo con validaciones
  - ✅ Prevención de duplicados por servicio
  - ✅ Gestión de opciones por defecto

#### 3. ServicePlanService
- **Ubicación**: `src/services/services/service-plan.service.ts`
- **Funcionalidades**:
  - ✅ Generación automática de `type_plan_id`
  - ✅ CRUD completo con validaciones
  - ✅ Validación de existencia de month_id y screen_id
  - ✅ Prevención de combinaciones duplicadas
  - ✅ Matriz de precios completa

#### 4. ServicePricingIntegrationService
- **Ubicación**: `src/services/services/service-pricing-integration.service.ts`
- **Funcionalidades**:
  - ✅ Generación de matriz de precios
  - ✅ Detección de combinaciones faltantes
  - ✅ Estadísticas del sistema de pricing

### Controladores de Administración

#### 1. AdminMonthOptionsController
- **Ruta base**: `/api/admin/services/month-options`
- **Ubicación**: `src/services/controllers/admin-month-options.controller.ts`
- **Endpoints**:
  - `POST /:serviceId` - Crear opción de mes (month_id autogenerado)
  - `GET /service/:serviceId` - Listar por servicio
  - `GET /:monthId` - Obtener por ID
  - `PUT /:monthId` - Actualizar
  - `DELETE /:monthId` - Eliminar
  - `PATCH /:monthId/default` - Establecer como predeterminado

#### 2. AdminScreenOptionsController
- **Ruta base**: `/api/admin/services/screen-options`
- **Ubicación**: `src/services/controllers/admin-screen-options.controller.ts`
- **Endpoints**:
  - `POST /:serviceId` - Crear opción de pantalla (screen_id autogenerado)
  - `GET /service/:serviceId` - Listar por servicio
  - `GET /:screenId` - Obtener por ID
  - `PUT /:screenId` - Actualizar
  - `DELETE /:screenId` - Eliminar
  - `PATCH /:screenId/default` - Establecer como predeterminado

#### 3. AdminServicePlansController
- **Ruta base**: `/api/admin/services/plans`
- **Ubicación**: `src/services/controllers/admin-service-plans.controller.ts`
- **Endpoints**:
  - `POST /:serviceId` - Crear plan (type_plan_id autogenerado)
  - `GET /service/:serviceId` - Listar por servicio
  - `GET /:planId` - Obtener por ID
  - `PUT /:planId` - Actualizar
  - `DELETE /:planId` - Eliminar
  - `GET /combo/:serviceId/:monthId/:screenId` - Obtener por combinación

#### 4. AdminServicePricingController
- **Ruta base**: `/api/admin/services/plans`
- **Ubicación**: `src/services/controllers/admin-service-pricing.controller.ts`
- **Endpoints**:
  - `GET /matrix/:serviceId` - Matriz completa de precios
  - `GET /missing/:serviceId` - Combinaciones faltantes
  - `GET /stats/:serviceId` - Estadísticas del pricing

## 📊 DTOs de Validación

### CreateServiceMonthOptionDto
```typescript
{
  month: number;              // Duración en meses
  month_content: string;      // Descripción ("1 mes")
  sort?: number;              // Orden de visualización
  is_default?: boolean;       // Es opción por defecto
  active?: boolean;           // Estado activo
}
// ❌ NO incluir month_id (se genera automáticamente)
```

### CreateServiceScreenOptionDto
```typescript
{
  max_user: number;           // Usuarios máximos
  substitute_recharge: number; // Recargas de sustitución
  screen: number;             // Número de pantallas
  screen_content: string;     // Descripción ("1 perfil")
  seat_type: string;          // Tipo ("Individual", "Familiar")
  sort?: number;              // Orden de visualización
  is_default?: boolean;       // Es opción por defecto
  active?: boolean;           // Estado activo
}
// ❌ NO incluir screen_id (se genera automáticamente)
```

### CreateServicePlanDto
```typescript
{
  month_id: number;           // ✅ Referencia a month_id existente
  screen_id: number;          // ✅ Referencia a screen_id existente
  plan_type: 'plan' | 'repayment';
  currency_icon1: string;     // "S/"
  currency_icon2: string;     // "PEN"
  currency_show_type: number; // 1
  original_price: number;     // Precio original
  sale_price: number;         // Precio de venta
  average_price: number;      // Precio promedio por mes
  discount: string;           // "20%"
  sort?: number;              // Orden
  active?: boolean;           // Estado activo
}
// ❌ NO incluir type_plan_id (se genera automáticamente)
```

## 🔐 Autenticación y Seguridad

- **Guards**: AdminJwtAuthGuard, AdminPermissionGuard
- **Ubicación**: `src/admin/guards/`
- **Requiere**: Token de administrador válido
- **Headers**: `Authorization: Bearer {token}`

## 🌐 Ejemplo de Integración - Disney+

### Datos de Ejemplo
```javascript
// Service ID
const serviceId = "68903254d69fe657139074f2";

// Opciones de Meses
[
  { month_id: 4, month: 1, month_content: "1 mes", is_default: true },
  { month_id: 5, month: 3, month_content: "3 meses", is_default: false }
]

// Opciones de Pantallas
[
  { screen_id: 4, screen: 1, screen_content: "1 perfil", seat_type: "Individual", is_default: true }
]

// Planes de Precios
[
  { type_plan_id: 10, month_id: 4, screen_id: 4, sale_price: 7.99, discount: "20%" },
  { type_plan_id: 11, month_id: 5, screen_id: 4, sale_price: 21.99, discount: "15%" }
]
```

## 📁 Estructura de Archivos del Proyecto

```
src/services/
├── schemas-new/
│   ├── service-month-option.schema.ts
│   ├── service-screen-option.schema.ts
│   ├── service-plan.schema.ts
│   └── index.ts
├── services/
│   ├── service-month-option.service.ts
│   ├── service-screen-option.service.ts
│   ├── service-plan.service.ts
│   ├── service-pricing-integration.service.ts
│   └── index.ts
├── controllers/
│   ├── admin-month-options.controller.ts
│   ├── admin-screen-options.controller.ts
│   ├── admin-service-plans.controller.ts
│   ├── admin-service-pricing.controller.ts
│   └── index.ts
├── dto/
│   └── service-plans.dto.ts
└── services.module.ts

scripts/
├── seed-pricing-data.js
├── verify-pricing-db.js
├── test-pricing-modular.sh
└── demo-disney-auto-ids.sh
```

---

# 🎯 Prompt para Integración Frontend

**Para GitHub Copilot en tu Frontend:**

```
Necesito integrar un sistema de administración de pricing modular para servicios de streaming en mi frontend. 

CONTEXTO DEL BACKEND:
- API Base: http://localhost:3000/api
- Autenticación: Bearer token en header Authorization
- Sistema modular con 3 entidades: ServiceMonthOption, ServiceScreenOption, ServicePlan

FUNCIONALIDADES REQUERIDAS:

1. **Gestión de Opciones de Duración** (/admin/services/month-options)
   - Crear opciones de meses (1, 3, 6, 12) - month_id se genera automáticamente
   - Listar, editar, eliminar opciones por servicio
   - Establecer opción por defecto
   - Validar duplicados por servicio

2. **Gestión de Opciones de Pantallas** (/admin/services/screen-options)
   - Crear opciones de pantallas/perfiles (1, 2, 4) - screen_id se genera automáticamente
   - Configurar usuarios máximos, tipo de asiento
   - Listar, editar, eliminar opciones por servicio
   - Establecer opción por defecto

3. **Gestión de Planes de Precios** (/admin/services/plans)
   - Crear planes combinando month_id + screen_id existentes - type_plan_id se genera automáticamente
   - Configurar precios originales, de venta, descuentos
   - Moneda en soles peruanos (S/ - PEN)
   - Matriz de precios visual
   - Detectar combinaciones faltantes

4. **Interfaz de Administración**
   - Dashboard con estadísticas de pricing
   - Formularios para CRUD de cada entidad
   - Matriz visual de precios por servicio
   - Alertas de combinaciones faltantes
   - Validaciones en tiempo real

DATOS DE EJEMPLO (Disney+):
- Service ID: 68903254d69fe657139074f2
- Meses: 1 mes (S/ 7.99), 3 meses (S/ 21.99)
- Pantallas: 1 perfil Individual
- Los IDs se generan automáticamente, no los incluyas en formularios

ESTRUCTURA DE RESPUESTA API:
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* objeto creado/actualizado */ }
}
```

CONSIDERACIONES TÉCNICAS:
- month_id, screen_id, type_plan_id son autogenerados (NO incluir en forms)
- Validar que month_id y screen_id existan antes de crear planes
- Manejar errores de duplicados y validación
- Implementar paginación para listas grandes
- Responsive design para móviles
- Confirmaciones para eliminaciones

Genera componentes React/Vue/Angular modernos con estas funcionalidades, manejo de estado, validaciones y UX profesional.
```

**Archivos clave para consultar en el proyecto:**
- `src/services/dto/service-plans.dto.ts` - Estructura de datos
- `src/services/controllers/admin-*.controller.ts` - Endpoints disponibles
- `src/services/services/*.service.ts` - Lógica de negocio
- `scripts/demo-disney-auto-ids.sh` - Ejemplo de uso completo
