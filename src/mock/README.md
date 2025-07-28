# Mock Data

Esta carpeta contiene los datos de prueba (mock data) utilizados por la aplicación para inicializar configuraciones por defecto.

## Archivos

### default-site-config.json
Contiene la configuración por defecto del sitio incluyendo:
- Navegación principal y footer
- Menús del centro de usuario
- Logos y branding
- Configuraciones específicas de servicios (Netflix, etc.)

### default-catalog.json
Contiene el catálogo por defecto de productos/servicios incluyendo:
- Pestañas de clasificación (SVOD, Música, AI, Software, etc.)
- Estadísticas del sitio
- Lista de productos con detalles completos

### Content Files (Archivos de Contenido)

#### Formato Legacy (Sin Active Flags)
- **default-content-es.json**: Contenido en español (formato original)
- **default-content-en.json**: Contenido en inglés (formato original)

#### Formato con Active Flags (Control Granular)
- **default-content-es-with-active.json**: Contenido en español con flags activos
- **default-content-en-with-active.json**: Contenido en inglés con flags activos

### Sistema de Active Flags

Los archivos con active flags permiten control granular sobre qué contenido se muestra:

```json
{
  "head5": { "text": "VENDENOS", "active": false },
  "head6": { "text": "Buscar...", "active": true }
}
```

**Características:**
- ✅ Control individual por clave de contenido
- ✅ Activación/desactivación en tiempo real vía API
- ✅ Filtrado automático (solo contenido activo se retorna)
- ✅ Soporte completo para español e inglés
- ✅ Compatible con sistema de secciones

### APIs Disponibles

#### Cargar Contenido con Active Flags
```bash
# Español
POST /api/content/update-spanish-with-active

# Inglés  
POST /api/content/update-english-with-active
```

#### Activar/Desactivar Contenido
```bash
PUT /api/content/toggle-active/:language/:section/:key
Body: {"active": true|false}

# Ejemplo:
PUT /api/content/toggle-active/es/head/head5
Body: {"active": true}
```

#### Obtener Contenido Filtrado
```bash
POST /api/webpage/key
Body: {"key": ["head", "home"], "language": "es"}
```

## Uso

Estos archivos son cargados automáticamente por la aplicación cuando no existe configuración en la base de datos. Se utilizan a través de la clase `MockDataLoader` ubicada en `src/utils/mock-data-loader.ts`.

## Modificación

Para cambiar los datos por defecto:
1. Edita directamente los archivos JSON
2. Reinicia la aplicación
3. Los nuevos datos se aplicarán la próxima vez que se cree una configuración por defecto

## Pruebas

Ejecuta el script de prueba multiidioma:
```bash
./test-multilingual-active-flags.sh
```

## Nota

Estos datos son solo para propósitos de desarrollo y pruebas. En producción, la configuración debe ser establecida a través de las APIs correspondientes o el panel administrativo.
