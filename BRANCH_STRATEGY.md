# 🌿 Estrategia de Ramas - E-commerce NestJS

## 📋 Estructura de Ramas

### `main` (Rama Principal)
- **Propósito**: Versión estándar de NestJS e-commerce
- **Contenido**: E-commerce básico sin funcionalidades SaaS
- **Estado**: Versión simple, single-tenant
- **Para**: Desarrollo tradicional, un solo cliente

### `saas-multitenant` (Rama SaaS)
- **Propósito**: Versión completa SaaS multi-tenant
- **Contenido**: Sistema completo con todas las funcionalidades SaaS
- **Estado**: Multi-tenant con gestión de planes y límites
- **Para**: Negocio SaaS, múltiples clientes

## 🚀 Comandos para Cambiar entre Versiones

### Para trabajar en la versión SaaS:
```bash
git checkout saas-multitenant
npm install
npm run start
```

### Para volver a la versión estándar:
```bash
git checkout main
npm install
npm run start
```

## 📊 Comparación de Funcionalidades

| Funcionalidad | Rama `main` | Rama `saas-multitenant` |
|---------------|-------------|-------------------------|
| E-commerce básico | ✅ | ✅ |
| Autenticación | ✅ | ✅ |
| Catálogo | ✅ | ✅ (Aislado por tenant) |
| Multi-tenancy | ❌ | ✅ |
| Gestión de planes | ❌ | ✅ |
| Sistema de límites | ❌ | ✅ |
| Analytics por tenant | ❌ | ✅ |
| API de gestión SaaS | ❌ | ✅ |

## 🔄 Flujo de Desarrollo

### Desarrollo en Rama SaaS:
1. `git checkout saas-multitenant`
2. Hacer cambios SaaS específicos
3. `git add . && git commit -m "feat: nueva funcionalidad SaaS"`
4. `git push origin saas-multitenant`

### Desarrollo en Rama Principal:
1. `git checkout main`
2. Hacer mejoras al e-commerce base
3. `git add . && git commit -m "feat: mejora en e-commerce"`
4. `git push origin main`

### Sincronización entre Ramas:
```bash
# Para llevar mejoras del e-commerce base a SaaS
git checkout saas-multitenant
git merge main

# Para llevar funcionalidades SaaS a main (si es necesario)
git checkout main
git cherry-pick <commit-hash>
```

## 📦 Archivos Específicos por Rama

### Solo en `saas-multitenant`:
- `src/tenant/` (todo el directorio)
- `src/usage/` (todo el directorio)
- `src/common/guards/tenant-limits.guard.ts`
- `scripts/seed-tenants.ts`
- `scripts/full-demo.sh`
- `BUSINESS_MODEL.md`
- `CONGRATULATIONS.md`
- `MULTI_TENANT_GUIDE.md`

### En ambas ramas:
- `src/catalog/`
- `src/auth/`
- `src/config/`
- `package.json` (con diferencias)
- `README.md` (con diferencias)

## 🎯 Casos de Uso

### Usar rama `main` cuando:
- Desarrolles para un solo cliente
- Quieras una solución simple
- No necesites funcionalidades SaaS
- Hagas un MVP rápido

### Usar rama `saas-multitenant` cuando:
- Desarrolles un negocio SaaS
- Necesites servir múltiples clientes
- Quieras monetizar como servicio
- Requieras aislamiento de datos

## 🔧 Setup Inicial de Ramas

```bash
# 1. Commit inicial en main
git add .
git commit -m "feat: e-commerce básico NestJS"

# 2. Crear rama SaaS
git checkout -b saas-multitenant
git commit -m "feat: conversión completa a SaaS multi-tenant"

# 3. Volver a main para desarrollo estándar
git checkout main
```
