# NestJS E-commerce Backend

Este es un proyecto de backend para una aplicación de e-commerce personalizable, construido con NestJS y MongoDB como base de datos no relacional.

## Estructura del Proyecto

El proyecto está organizado en varios módulos, cada uno responsable de una parte específica de la funcionalidad de la aplicación:

- **Auth**: Maneja la autenticación de usuarios, incluyendo inicio de sesión y registro.
- **Users**: Gestiona la información de los usuarios, incluyendo la creación y actualización de perfiles.
- **Products**: Administra los productos disponibles en la tienda.
- **Categories**: Organiza los productos en categorías.
- **Orders**: Maneja la creación y gestión de pedidos.
- **Cart**: Permite a los usuarios gestionar su carrito de compras.
- **Customization**: Permite la personalización de productos.

## Requisitos

- Node.js
- MongoDB

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Navega al directorio del proyecto:
   ```
   cd nestjs-ecommerce-backend
   ```

3. Instala las dependencias:
   ```
   npm install
   ```

4. Configura las variables de entorno en el archivo `.env`.

## Ejecución

Para iniciar el servidor de desarrollo, ejecuta:
```
npm run start:dev
```

## Pruebas

Para ejecutar las pruebas de extremo a extremo, utiliza:
```
npm run test:e2e
```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.