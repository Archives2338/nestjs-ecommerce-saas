# 🚀 Guía para Subir tu Proyecto a GitHub

## 🔐 Configuración de Autenticación

### Opción 1: Personal Access Token (Recomendada)

1. **Crear un Personal Access Token:**
   - Ve a: https://github.com/settings/tokens
   - Click en "Generate new token" → "Generate new token (classic)"
   - Nombre: `nestjs-ecommerce-saas-token`
   - Expiration: `90 days` (o lo que prefieras)
   - Scopes: Marca `repo` (para acceso completo a repositorios)
   - Click en "Generate token"
   - **¡GUARDA EL TOKEN!** (lo necesitarás en el siguiente paso)

2. **Configurar Git para usar el token:**
   ```bash
   git remote set-url origin https://TU_USERNAME:TU_TOKEN@github.com/Archives2338/nestjs-ecommerce-saas.git
   ```

3. **Subir las ramas:**
   ```bash
   # Subir rama SaaS
   git push -u origin saas-multitenant
   
   # Crear y subir rama main (versión estándar)
   git checkout -b main
   git push -u origin main
   ```

### Opción 2: GitHub CLI (Alternativa)

1. **Instalar GitHub CLI:**
   ```bash
   brew install gh
   ```

2. **Autenticarse:**
   ```bash
   gh auth login
   ```

3. **Subir el repositorio:**
   ```bash
   gh repo create nestjs-ecommerce-saas --public --source=. --remote=origin --push
   ```

## 📋 Comandos Completos para Ejecutar

### Una vez autenticado, ejecuta:

```bash
# 1. Subir la rama SaaS actual
git push -u origin saas-multitenant

# 2. Crear rama main (versión estándar sin SaaS)
git checkout -b main

# 3. Remover archivos específicos de SaaS (opcional)
# git rm -r src/tenant/ src/usage/ src/common/guards/
# git rm BUSINESS_MODEL.md CONGRATULATIONS.md MULTI_TENANT_GUIDE.md

# 4. Subir rama main
git push -u origin main

# 5. Volver a rama SaaS para continuar desarrollo
git checkout saas-multitenant
```

## 🌍 Donde Ver tu Repositorio

Una vez subido, podrás verlo en:
**https://github.com/Archives2338/nestjs-ecommerce-saas**

### Ramas disponibles:
- `saas-multitenant`: Versión completa SaaS
- `main`: Versión estándar e-commerce

## 🔄 Trabajo Futuro

```bash
# Para trabajar en SaaS:
git checkout saas-multitenant
git pull origin saas-multitenant
# hacer cambios...
git add . && git commit -m "feat: nueva funcionalidad"
git push origin saas-multitenant

# Para trabajar en versión estándar:
git checkout main
git pull origin main
# hacer cambios...
git add . && git commit -m "feat: mejora base"
git push origin main
```
