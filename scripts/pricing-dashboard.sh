#!/bin/bash

# 📊 Dashboard de Monitoreo en Tiempo Real - Sistema Pricing Modular
# Muestra estadísticas en vivo del sistema

echo "📊 ======================================="
echo "   DASHBOARD PRICING MODULAR EN VIVO"
echo "======================================="

BASE_URL="http://localhost:3000/api"
SERVICE_ID="68903254d69fe657139074f2"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Función para limpiar pantalla
clear_screen() {
    clear
    echo -e "${WHITE}📊 =======================================${NC}"
    echo -e "${WHITE}   DASHBOARD PRICING MODULAR EN VIVO${NC}"
    echo -e "${WHITE}=======================================${NC}"
    echo -e "${CYAN}🕐 $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}🔗 Service ID: $SERVICE_ID${NC}"
    echo ""
}

# Función para obtener estadísticas
get_stats() {
    # Month Options
    months_response=$(curl -s "$BASE_URL/admin/services/month-options/service/$SERVICE_ID" 2>/dev/null)
    month_count=$(echo "$months_response" | jq '.data | length' 2>/dev/null || echo "0")
    month_active=$(echo "$months_response" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "0")
    month_default=$(echo "$months_response" | jq '[.data[] | select(.is_default == true)] | length' 2>/dev/null || echo "0")
    
    # Screen Options
    screens_response=$(curl -s "$BASE_URL/admin/services/screen-options/service/$SERVICE_ID" 2>/dev/null)
    screen_count=$(echo "$screens_response" | jq '.data | length' 2>/dev/null || echo "0")
    screen_active=$(echo "$screens_response" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "0")
    screen_default=$(echo "$screens_response" | jq '[.data[] | select(.is_default == true)] | length' 2>/dev/null || echo "0")
    
    # Service Plans
    plans_response=$(curl -s "$BASE_URL/admin/services/plans/service/$SERVICE_ID" 2>/dev/null)
    plan_count=$(echo "$plans_response" | jq '.data | length' 2>/dev/null || echo "0")
    plan_active=$(echo "$plans_response" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "0")
    
    # Pricing Stats
    stats_response=$(curl -s "$BASE_URL/admin/services/plans/stats/$SERVICE_ID" 2>/dev/null)
    
    # Missing combinations
    missing_response=$(curl -s "$BASE_URL/admin/services/plans/missing/$SERVICE_ID" 2>/dev/null)
    missing_count=$(echo "$missing_response" | jq '.data | length' 2>/dev/null || echo "0")
}

# Función para mostrar estadísticas
show_stats() {
    # Header con resumen
    echo -e "${PURPLE}┌─────────────────────────────────────────┐${NC}"
    echo -e "${PURPLE}│${NC}${WHITE}            RESUMEN GENERAL              ${NC}${PURPLE}│${NC}"
    echo -e "${PURPLE}└─────────────────────────────────────────┘${NC}"
    
    echo -e "${BLUE}📅 Month Options:${NC}    $month_count total | $month_active activas | $month_default default"
    echo -e "${BLUE}📺 Screen Options:${NC}   $screen_count total | $screen_active activas | $screen_default default"
    echo -e "${BLUE}💰 Service Plans:${NC}    $plan_count total | $plan_active activos"
    echo -e "${BLUE}⚠️  Faltantes:${NC}       $missing_count combinaciones"
    
    # Matriz de cobertura
    if [ "$month_count" -gt 0 ] && [ "$screen_count" -gt 0 ]; then
        expected_plans=$((month_count * screen_count))
        coverage=$((plan_count * 100 / expected_plans))
        
        echo -e "${PURPLE}┌─────────────────────────────────────────┐${NC}"
        echo -e "${PURPLE}│${NC}${WHITE}          COBERTURA DE MATRIZ            ${NC}${PURPLE}│${NC}"
        echo -e "${PURPLE}└─────────────────────────────────────────┘${NC}"
        
        echo -e "${CYAN}🎯 Planes esperados:${NC}  $expected_plans ($month_count meses × $screen_count pantallas)"
        echo -e "${CYAN}📊 Planes creados:${NC}   $plan_count"
        
        if [ "$coverage" -eq 100 ]; then
            echo -e "${GREEN}✅ Cobertura:${NC}        ${GREEN}$coverage% (COMPLETA)${NC}"
        elif [ "$coverage" -ge 80 ]; then
            echo -e "${YELLOW}🔶 Cobertura:${NC}        ${YELLOW}$coverage% (BUENA)${NC}"
        else
            echo -e "${RED}❌ Cobertura:${NC}        ${RED}$coverage% (INCOMPLETA)${NC}"
        fi
    fi
    
    echo ""
    
    # Detalles de Month Options
    if [ "$month_count" -gt 0 ]; then
        echo -e "${PURPLE}┌─────────────────────────────────────────┐${NC}"
        echo -e "${PURPLE}│${NC}${WHITE}           OPCIONES DE MESES             ${NC}${PURPLE}│${NC}"
        echo -e "${PURPLE}└─────────────────────────────────────────┘${NC}"
        
        echo "$months_response" | jq -r '.data[] | "🔹 ID: \(.month_id) | \(.month) meses (\(.month_content)) | \(if .is_default then "⭐ DEFAULT" else "  " end) | \(if .active then "🟢 ACTIVO" else "🔴 INACTIVO" end)"' 2>/dev/null
        echo ""
    fi
    
    # Detalles de Screen Options
    if [ "$screen_count" -gt 0 ]; then
        echo -e "${PURPLE}┌─────────────────────────────────────────┐${NC}"
        echo -e "${PURPLE}│${NC}${WHITE}          OPCIONES DE PANTALLAS          ${NC}${PURPLE}│${NC}"
        echo -e "${PURPLE}└─────────────────────────────────────────┘${NC}"
        
        echo "$screens_response" | jq -r '.data[] | "🔹 ID: \(.screen_id) | \(.screen) pantallas (\(.screen_content)) | \(.seat_type) | \(if .is_default then "⭐ DEFAULT" else "  " end) | \(if .active then "🟢 ACTIVO" else "🔴 INACTIVO" end)"' 2>/dev/null
        echo ""
    fi
    
    # Detalles de precios más recientes
    if [ "$plan_count" -gt 0 ]; then
        echo -e "${PURPLE}┌─────────────────────────────────────────┐${NC}"
        echo -e "${PURPLE}│${NC}${WHITE}          PLANES MÁS RECIENTES           ${NC}${PURPLE}│${NC}"
        echo -e "${PURPLE}└─────────────────────────────────────────┘${NC}"
        
        echo "$plans_response" | jq -r '.data | sort_by(.type_plan_id) | reverse | .[0:5][] | "💰 Plan ID: \(.type_plan_id) | M:\(.month_id) S:\(.screen_id) | \(.currency_icon1)\(.sale_price) | \(.discount) desc | \(if .active then "🟢" else "🔴" end)"' 2>/dev/null
        echo ""
    fi
    
    # Status del servidor
    echo -e "${PURPLE}┌─────────────────────────────────────────┐${NC}"
    echo -e "${PURPLE}│${NC}${WHITE}           STATUS DEL SERVIDOR           ${NC}${PURPLE}│${NC}"
    echo -e "${PURPLE}└─────────────────────────────────────────┘${NC}"
    
    server_status=$(curl -s -w "%{http_code}" "$BASE_URL" 2>/dev/null)
    status_code="${server_status: -3}"
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "404" ]; then
        echo -e "${GREEN}🟢 Servidor NestJS:${NC}   ONLINE (Status: $status_code)"
    else
        echo -e "${RED}🔴 Servidor NestJS:${NC}   OFFLINE o ERROR"
    fi
    
    echo -e "${BLUE}🌐 Base URL:${NC}         $BASE_URL"
    echo ""
}

# Función principal de monitoreo
monitor() {
    while true; do
        clear_screen
        get_stats
        show_stats
        
        echo -e "${CYAN}┌─────────────────────────────────────────┐${NC}"
        echo -e "${CYAN}│${NC}${WHITE}              CONTROLES                  ${NC}${CYAN}│${NC}"
        echo -e "${CYAN}└─────────────────────────────────────────┘${NC}"
        echo -e "${YELLOW}Presiona Ctrl+C para salir | Actualización cada 5 segundos${NC}"
        echo ""
        
        # Esperar 5 segundos con posibilidad de interrumpir
        for i in {5..1}; do
            echo -ne "\r${BLUE}⏱️  Próxima actualización en: ${i}s${NC}  "
            sleep 1
        done
        echo ""
    done
}

# Verificar que el servidor esté disponible
echo -e "${YELLOW}🔍 Verificando conectividad con el servidor...${NC}"
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No se puede conectar al servidor en $BASE_URL${NC}"
    echo -e "${YELLOW}   Asegúrate de que NestJS esté corriendo en el puerto 3000${NC}"
    echo -e "${BLUE}   Comando: npm run start:dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conectividad verificada${NC}"
echo -e "${BLUE}🚀 Iniciando dashboard en vivo...${NC}"
sleep 2

# Capturar Ctrl+C para salida limpia
trap 'echo -e "\n${GREEN}👋 Dashboard finalizado${NC}"; exit 0' INT

# Iniciar monitoreo
monitor
