# Contexto del Proyecto - NestJS E-commerce SaaS Backend

## 🎯 Propósito del Proyecto

Este proyecto es un **backend SaaS de e-commerce especializado en la venta y gestión de cuentas de servicios de streaming** como Netflix, Spotify, YouTube Premium, Disney+, etc.

### Modelo de Negocio
- **Venta de accesos**: Los administradores compran cuentas de servicios premium y las revenden con planes compartidos
- **Gestión de slots**: Cada cuenta puede tener múltiples usuarios (slots) según el plan del servicio
- **Multi-tenant**: Soporte para múltiples clientes/empresas con aislamiento de datos
- **Automatización**: Asignación automática de cuentas disponibles a nuevas órdenes

## 🏗️ Arquitectura Actual

### Entidades Principales
1. **Services** (`/services`): Catálogo de servicios (Netflix, Spotify, etc.) con planes y precios
2. **Accounts** (`/accounts`): Gestión de cuentas reales de los servicios con credenciales
3. **User Orders** (`user-order.schema.ts`): Órdenes de compra de usuarios finales
4. **Auth**: Sistema de autenticación JWT para usuarios y administradores

### Flujo de Negocio Actual
```
1. Admin crea servicios con planes → Services
2. Admin agrega cuentas reales → Accounts  
3. Usuario hace pedido → User Order
4. Sistema asigna cuenta disponible automáticamente
5. Usuario recibe credenciales de acceso
```

### Esquemas de Cuentas
- **Account Schema**: Almacena cuentas reales con credenciales encriptadas
- **Slot Management**: Control de usuarios simultáneos por cuenta
- **Status Management**: Estados (disponible, asignado, mantenimiento, etc.)

## 🔐 Separación de Responsabilidades

### Vista Administrador
- ✅ Crear/gestionar servicios y planes
- ✅ Agregar/administrar cuentas reales  
- ✅ Ver estadísticas y reportes
- ✅ Gestionar asignaciones de slots

### Vista Usuario Final
- ✅ Ver catálogo de servicios
- ✅ Realizar compras
- ✅ Acceder a credenciales asignadas
- ✅ Ver historial de órdenes

## 🎯 Próximos Pasos de Desarrollo

### Mejoras de Seguridad
- [ ] Encriptación avanzada de credenciales
- [ ] Separación física de credenciales sensibles
- [ ] Auditoría de accesos a credenciales

### Escalabilidad
- [ ] Optimización de asignación de cuentas
- [ ] Cache para consultas frecuentes
- [ ] Monitoreo de salud de cuentas

### Nuevas Funcionalidades
- [ ] Sistema de notificaciones
- [ ] Integración con pasarelas de pago
- [ ] Panel de análisis avanzado

---

## 📋 Prompt para IA

Cuando trabajes en este proyecto, recuerda:

**CONTEXTO**: Es un SaaS de e-commerce para venta de accesos a servicios de streaming. Los administradores gestionan cuentas reales y las asignan automáticamente a usuarios que compran planes.

**ARQUITECTURA**: NestJS + MongoDB con esquemas separados para Services (catálogo), Accounts (cuentas reales), y User Orders (compras).

**SEGURIDAD**: Las credenciales están marcadas como `select: false` y solo se exponen cuando es necesario.

**ESCALABILIDAD**: Considera que el sistema manejará miles de cuentas y asignaciones automáticas.

**ROLES**: Distingue entre vista de administrador (gestión completa) y usuario final (solo consumo).
