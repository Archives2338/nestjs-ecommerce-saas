#!/bin/bash

# Script de migración de datos entre diferentes proveedores MongoDB
# Uso: ./scripts/migrate-database.sh [source] [destination]

set -e

echo "🔄 Script de Migración de Base de Datos MongoDB"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  export-local     Exportar datos desde MongoDB local"
    echo "  export-railway   Exportar datos desde Railway MongoDB"
    echo "  import-atlas     Importar datos a MongoDB Atlas"
    echo "  import-digital   Importar datos a DigitalOcean MongoDB"
    echo "  backup-local     Crear backup de MongoDB local"
    echo "  help            Mostrar esta ayuda"
    echo ""
    echo "Variables de entorno requeridas:"
    echo "  MONGODB_LOCAL_URI    - URI de MongoDB local"
    echo "  MONGODB_RAILWAY_URI  - URI de MongoDB Railway"  
    echo "  MONGODB_ATLAS_URI    - URI de MongoDB Atlas"
    echo "  MONGODB_DO_URI       - URI de DigitalOcean MongoDB"
}

# Función para verificar si mongodump está instalado
check_mongo_tools() {
    if ! command -v mongodump &> /dev/null; then
        echo -e "${RED}❌ Error: mongodump no está instalado${NC}"
        echo "Instalar con: brew install mongodb/brew/mongodb-database-tools"
        exit 1
    fi
}

# Función para crear backup
backup_database() {
    local source_uri=$1
    local backup_name=$2
    
    echo -e "${BLUE}📦 Creando backup: $backup_name${NC}"
    
    mongodump --uri="$source_uri" --out="./backups/$backup_name-$(date +%Y%m%d_%H%M%S)"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup creado exitosamente${NC}"
    else
        echo -e "${RED}❌ Error creando backup${NC}"
        exit 1
    fi
}

# Función para restaurar backup
restore_database() {
    local destination_uri=$1
    local backup_path=$2
    
    echo -e "${BLUE}📥 Restaurando backup a destino${NC}"
    
    mongorestore --uri="$destination_uri" --drop "$backup_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Datos restaurados exitosamente${NC}"
    else
        echo -e "${RED}❌ Error restaurando datos${NC}"
        exit 1
    fi
}

# Función para comparar costos
show_cost_comparison() {
    echo -e "${YELLOW}💰 Comparación de Costos Mensual${NC}"
    echo "=================================="
    echo "📍 MongoDB Local:        $0/mes (solo hosting VPS)"
    echo "🚂 Railway MongoDB:      $5-20/mes (según uso)"
    echo "☁️  MongoDB Atlas M10:    $9/mes (2GB)"
    echo "🌊 DigitalOcean Basic:   $15/mes (1GB)"
    echo "🏢 AWS DocumentDB:       $50+/mes (enterprise)"
    echo ""
    echo -e "${BLUE}💡 Recomendación:${NC}"
    echo "• Desarrollo: MongoDB Local + Railway"
    echo "• Producción pequeña: MongoDB Atlas Free/M10"
    echo "• Producción media: DigitalOcean o Railway" 
    echo "• Producción enterprise: AWS DocumentDB"
}

# Función principal
main() {
    check_mongo_tools
    
    case ${1:-help} in
        export-local)
            backup_database "${MONGODB_LOCAL_URI:-mongodb://localhost:27017/ecommerce_saas}" "local"
            ;;
        export-railway)
            if [ -z "$MONGODB_RAILWAY_URI" ]; then
                echo -e "${RED}❌ Error: MONGODB_RAILWAY_URI no definida${NC}"
                exit 1
            fi
            backup_database "$MONGODB_RAILWAY_URI" "railway"
            ;;
        import-atlas)
            if [ -z "$MONGODB_ATLAS_URI" ]; then
                echo -e "${RED}❌ Error: MONGODB_ATLAS_URI no definida${NC}"
                exit 1
            fi
            latest_backup=$(ls -1t ./backups/ | head -n1)
            restore_database "$MONGODB_ATLAS_URI" "./backups/$latest_backup"
            ;;
        import-digital)
            if [ -z "$MONGODB_DO_URI" ]; then
                echo -e "${RED}❌ Error: MONGODB_DO_URI no definida${NC}"
                exit 1
            fi
            latest_backup=$(ls -1t ./backups/ | head -n1)
            restore_database "$MONGODB_DO_URI" "./backups/$latest_backup"
            ;;
        backup-local)
            backup_database "${MONGODB_LOCAL_URI:-mongodb://localhost:27017/ecommerce_saas}" "local-backup"
            ;;
        costs)
            show_cost_comparison
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Crear directorio de backups si no existe
mkdir -p ./backups

# Ejecutar función principal
main "$@"
