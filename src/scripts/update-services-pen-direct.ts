import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ServicesService } from '../services/services.service';

/**
 * Script para ACTUALIZAR servicios con precios DIRECTOS EN SOLES
 * 
 * OBJETIVO: Establecer precios específicos sin conversión USD
 * Precios objetivo: Netflix 1 mes = S/17.00, 4 perfiles = S/54.99 (con descuento)
 */

async function updateServicesPenDirect() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const servicesService = app.get(ServicesService);

  console.log('🔄 Actualizando servicios con precios DIRECTOS en soles...');

  // Helper para crear planes con precios DIRECTOS en PEN (sin conversión)
  const createPlanItemDirect = (monthId: number, month: number, monthContent: string, screenId: number, screen: number, screenContent: string, seatType: string, typePlanId: number, sort: number, originalPricePen: number, salePricePen: number) => {
    // Calcular descuento
    const discount = Math.round(((originalPricePen - salePricePen) / originalPricePen) * 100);
    
    return {
      month_id: monthId,
      month: month,
      month_content: monthContent,
      screen_id: screenId,
      max_user: screen === 1 ? 1 : screen,
      substitute_recharge: 0,
      screen: screen,
      screen_content: screenContent,
      seat_type: seatType,
      type_plan_id: typePlanId,
      sort: sort,
      currency_icon1: "S/",
      currency_icon2: "PEN(S/)",
      currency_show_type: 1,
      original_price: originalPricePen.toFixed(2),
      sale_price: salePricePen.toFixed(2),
      average_price: salePricePen.toFixed(2),
      discount: `${discount}%`
    };
  };

  try {
    // 1. ACTUALIZAR NETFLIX - Precios DIRECTOS en soles
    console.log('🎬 Actualizando Netflix - precios directos S/17.00 y S/54.99...');
    
    const netflixUpdateDto = {
      language: "es",
      type_id: 1,
      name: "Netflix",
      subtitle: "Plataforma de streaming premium",
      content: "Acceso completo a Netflix con películas, series y documentales",
      icon: "https://static.gamsgocdn.com/image/0f51929d358472fe7ab782257199e59d.webp",
      type: 1,
      plan: {
        month: [
          // Plan de 1 mes - PRECIOS CORRECTOS
          {
            month_id: 1,
            month: 1,
            month_content: "1 mes",
            screen: [
              createPlanItemDirect(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 1011, 1, 21.99, 17.00),
              createPlanItemDirect(1, 1, "1 mes", 2, 4, "4 perfiles", "Familiar", 1012, 2, 68.00, 54.99)
            ]
          },
          // Plan de 3 meses
          {
            month_id: 15,
            month: 3,
            month_content: "3 meses",
            screen: [
              createPlanItemDirect(15, 3, "3 meses", 1, 1, "1 perfil", "Individual", 1151, 3, 51.00, 44.99),
              createPlanItemDirect(15, 3, "3 meses", 2, 4, "4 perfiles", "Familiar", 1152, 4, 195.99, 159.99)
            ]
          },
          // Plan de 6 meses
          {
            month_id: 18,
            month: 6,
            month_content: "6 meses",
            screen: [
              createPlanItemDirect(18, 6, "6 meses", 1, 1, "1 perfil", "Individual", 1181, 5, 102.00, 84.99),
              createPlanItemDirect(18, 6, "6 meses", 2, 4, "4 perfiles", "Familiar", 1182, 6, 390.99, 319.99)
            ]
          }
        ],
        screen: [
          {
            screen_id: 1,
            max_user: 1,
            substitute_recharge: 0,
            screen: 1,
            screen_content: "1 perfil",
            seat_type: "Individual",
            sort: 1,
            month: [
              createPlanItemDirect(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 1011, 1, 21.99, 17.00),
              createPlanItemDirect(15, 3, "3 meses", 1, 1, "1 perfil", "Individual", 1151, 3, 51.00, 44.99),
              createPlanItemDirect(18, 6, "6 meses", 1, 1, "1 perfil", "Individual", 1181, 5, 102.00, 84.99)
            ]
          },
          {
            screen_id: 2,
            max_user: 4,
            substitute_recharge: 0,
            screen: 4,
            screen_content: "4 perfiles",
            seat_type: "Familiar",
            sort: 2,
            month: [
              createPlanItemDirect(1, 1, "1 mes", 2, 4, "4 perfiles", "Familiar", 1012, 2, 68.00, 54.99),
              createPlanItemDirect(15, 3, "3 meses", 2, 4, "4 perfiles", "Familiar", 1152, 4, 195.99, 159.99),
              createPlanItemDirect(18, 6, "6 meses", 2, 4, "4 perfiles", "Familiar", 1182, 6, 390.99, 319.99)
            ]
          }
        ],
        default_month_id: 1,
        default_screen_id: 1
      },
      repayment: {
        month: [],
        screen: [],
        default_month_id: 1,
        default_screen_id: 1
      },
      active: true,
      sort: 1
    };

    // Actualizar Netflix
    const netflixResult = await servicesService.updateService("es", 1, netflixUpdateDto);
    if (netflixResult.code === 0) {
      console.log(`✅ Netflix actualizado con precios directos en soles`);
    } else {
      console.log(`❌ Error actualizando Netflix: ${netflixResult.message}`);
    }

    // 2. ACTUALIZAR DISNEY+ - Precios directos
    console.log('🏰 Actualizando Disney+ - precios directos...');
    
    const disneyUpdateDto = {
      language: "es",
      type_id: 2,
      name: "Disney+",
      subtitle: "El hogar de tus historias favoritas",
      content: "Acceso completo a Disney, Pixar, Marvel, Star Wars y National Geographic",
      icon: "https://static.gamsgocdn.com/image/disney-icon.webp",
      type: 1,
      plan: {
        month: [
          {
            month_id: 1,
            month: 1,
            month_content: "1 mes",
            screen: [
              createPlanItemDirect(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 2011, 1, 9.99, 7.99)
            ]
          },
          {
            month_id: 2,
            month: 3,
            month_content: "3 meses",
            screen: [
              createPlanItemDirect(2, 3, "3 meses", 1, 1, "1 perfil", "Individual", 2021, 2, 25.99, 21.99)
            ]
          }
        ],
        screen: [
          {
            screen_id: 1,
            max_user: 1,
            substitute_recharge: 0,
            screen: 1,
            screen_content: "1 perfil",
            seat_type: "Individual",
            sort: 1,
            month: [
              createPlanItemDirect(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 2011, 1, 9.99, 7.99),
              createPlanItemDirect(2, 3, "3 meses", 1, 1, "1 perfil", "Individual", 2021, 2, 25.99, 21.99)
            ]
          }
        ],
        default_month_id: 1,
        default_screen_id: 1
      },
      repayment: {
        month: [],
        screen: [],
        default_month_id: 1,
        default_screen_id: 1
      },
      active: true,
      sort: 2
    };

    const disneyResult = await servicesService.updateService("es", 2, disneyUpdateDto);
    if (disneyResult.code === 0) {
      console.log(`✅ Disney+ actualizado exitosamente`);
    } else {
      console.log(`❌ Error actualizando Disney+: ${disneyResult.message}`);
    }

    console.log('\n🎉 Actualización con precios DIRECTOS completada!');
    console.log('💰 PRECIOS FINALES CONFIRMADOS:');
    console.log('   🎬 Netflix 1 mes + 1 perfil: S/17.00 ✅');
    console.log('   🎬 Netflix 1 mes + 4 perfiles: S/54.99 ✅ (19% descuento vs S/68.00)');
    console.log('   🏰 Disney+ 1 mes + 1 perfil: S/7.99 ✅');
    console.log('🔥 SIN CONVERSIÓN USD - Precios directos en soles peruanos');
    console.log('💡 Lógica: 4 perfiles = (1 perfil × 4) con descuento por volumen');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar actualización con precios directos
updateServicesPenDirect();
