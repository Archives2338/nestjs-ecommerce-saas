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

## Uso

Estos archivos son cargados automáticamente por la aplicación cuando no existe configuración en la base de datos. Se utilizan a través de la clase `MockDataLoader` ubicada en `src/utils/mock-data-loader.ts`.

## Modificación

Para cambiar los datos por defecto:
1. Edita directamente los archivos JSON
2. Reinicia la aplicación
3. Los nuevos datos se aplicarán la próxima vez que se cree una configuración por defecto

## Nota

Estos datos son solo para propósitos de desarrollo y pruebas. En producción, la configuración debe ser establecida a través de las APIs correspondientes o el panel administrativo.
