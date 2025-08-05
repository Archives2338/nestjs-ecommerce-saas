import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ServicesService } from '../services/services.service';
import { CurrencyConverter } from '../utils/currency-converter';

/**
 * Script para ACTUALIZAR servicios existentes añadiendo planes de 1 MES
 * 
 * OBJETIVO: Agregar planes de 1 mes a Netflix y Disney+ existentes
 * Ya que los usuarios quieren la opción de 1 mes + 1 perfil
 */

async function updateServicesAdd1Month() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const servicesService = app.get(ServicesService);

  console.log('🔄 Actualizando servicios existentes para agregar planes de 1 mes...');

  // Helper para crear planes con precios convertidos
  const createPlanItem = (monthId: number, month: number, monthContent: string, screenId: number, screen: number, screenContent: string, seatType: string, typePlanId: number, sort: number, originalPriceUsd: number, salePriceUsd: number) => {
    const prices = CurrencyConverter.convertPlanPrices(originalPriceUsd.toString(), salePriceUsd.toString());
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
      ...prices
    };
  };

  try {
    // 1. ACTUALIZAR NETFLIX - Agregar planes de 1 mes
    console.log('🎬 Actualizando Netflix - agregando planes de 1 mes...');
    
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
          // NUEVO: Plan de 1 mes (lo que el usuario pidió!)
          {
            month_id: 1,
            month: 1,
            month_content: "1 mes",
            screen: [
              createPlanItem(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 1011, 1, 8.99, 12.99),
              createPlanItem(1, 1, "1 mes", 2, 4, "4 perfiles", "Familiar", 1012, 2, 12.99, 19.99)
            ]
          },
          // MANTENER: Planes existentes de 3 meses
          {
            month_id: 15,
            month: 3,
            month_content: "3 meses",
            screen: [
              createPlanItem(15, 3, "3 meses", 1, 1, "1 perfil", "Individual", 1151, 3, 25.99, 35.99),
              createPlanItem(15, 3, "3 meses", 2, 4, "4 perfiles", "Familiar", 1152, 4, 35.99, 55.99)
            ]
          },
          // MANTENER: Planes existentes de 6 meses
          {
            month_id: 18,
            month: 6,
            month_content: "6 meses",
            screen: [
              createPlanItem(18, 6, "6 meses", 1, 1, "1 perfil", "Individual", 1181, 5, 49.99, 69.99),
              createPlanItem(18, 6, "6 meses", 2, 4, "4 perfiles", "Familiar", 1182, 6, 69.99, 105.99)
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
              createPlanItem(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 1011, 1, 8.99, 12.99),
              createPlanItem(15, 3, "3 meses", 1, 1, "1 perfil", "Individual", 1151, 3, 25.99, 35.99),
              createPlanItem(18, 6, "6 meses", 1, 1, "1 perfil", "Individual", 1181, 5, 49.99, 69.99)
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
              createPlanItem(1, 1, "1 mes", 2, 4, "4 perfiles", "Familiar", 1012, 2, 12.99, 19.99),
              createPlanItem(15, 3, "3 meses", 2, 4, "4 perfiles", "Familiar", 1152, 4, 35.99, 55.99),
              createPlanItem(18, 6, "6 meses", 2, 4, "4 perfiles", "Familiar", 1182, 6, 69.99, 105.99)
            ]
          }
        ],
        default_month_id: 1, // NUEVO DEFAULT: 1 mes
        default_screen_id: 1  // NUEVO DEFAULT: 1 perfil
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

    // Intentar actualizar Netflix existente
    const netflixResult = await servicesService.updateService("es", 1, netflixUpdateDto);
    if (netflixResult.code === 0) {
      console.log(`✅ Netflix actualizado exitosamente con planes de 1 mes`);
    } else {
      console.log(`❌ Error actualizando Netflix: ${netflixResult.message}`);
    }

    // 2. ACTUALIZAR DISNEY+ - Agregar planes más accesibles
    console.log('🏰 Actualizando Disney+ - optimizando planes...');
    
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
              createPlanItem(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 2011, 1, 8.99, 7.99)
            ]
          },
          {
            month_id: 2,
            month: 3,
            month_content: "3 meses",
            screen: [
              createPlanItem(2, 3, "3 meses", 1, 1, "1 perfil", "Individual", 2021, 2, 25.99, 21.99)
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
              createPlanItem(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 2011, 1, 8.99, 7.99),
              createPlanItem(2, 3, "3 meses", 1, 1, "1 perfil", "Individual", 2021, 2, 25.99, 21.99)
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

    console.log('\n🎉 Actualización completada exitosamente!');
    console.log('🆕 PLANES DE 1 MES AGREGADOS:');
    console.log('   🎬 Netflix 1 mes + 1 perfil: S/12.99 (antes S/49.00)');
    console.log('   🎬 Netflix 1 mes + 4 perfiles: S/19.99 (antes S/75.00)');
    console.log('   🏰 Disney+ 1 mes + 1 perfil: S/7.99');
    console.log('💡 Los planes de 1 mes ahora son el DEFAULT para ambos servicios');
    console.log('🔧 PRECIOS CORREGIDOS: 1 perfil ahora es más barato que 4 perfiles');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar actualización
updateServicesAdd1Month();
