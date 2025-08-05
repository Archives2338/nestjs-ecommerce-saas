import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ServicesService } from '../services/services.service';
import { CurrencyConverter } from '../utils/currency-converter';

/**
 * Script de seed para servicios de streaming con precios en SOLES
 * 
 * ACTUALIZADO: Todos los precios convertidos de USD a PEN
 * Tipo de cambio: 1 USD = 3.75 PEN
 */

async function seedServices() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const servicesService = app.get(ServicesService);

  console.log('🌱 Iniciando seed de servicios con precios en soles...');

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

  // NETFLIX - Convertido a soles con planes de 1 mes
  const netflixCreateDto = {
    language: "es",
    type_id: 1,
    name: "Netflix",
    subtitle: "Plataforma de streaming premium",
    content: "Acceso completo a Netflix con películas, series y documentales",
    icon: "https://static.gamsgocdn.com/image/0f51929d358472fe7ab782257199e59d.webp",
    type: 1,
    plan: {
      month: [
        {
          month_id: 1,
          month: 1,
          month_content: "1 mes",
          screen: [
            createPlanItem(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 1011, 1, 15.49, 12.99),
            createPlanItem(1, 1, "1 mes", 2, 4, "4 perfiles", "Familiar", 1012, 2, 22.99, 19.99)
          ]
        },
        {
          month_id: 15,
          month: 3,
          month_content: "3 meses",
          screen: [
            createPlanItem(15, 3, "3 meses", 1, 1, "1 perfil", "Individual", 1151, 3, 45.00, 35.99),
            createPlanItem(15, 3, "3 meses", 2, 4, "4 perfiles", "Familiar", 1152, 4, 65.99, 55.99)
          ]
        },
        {
          month_id: 18,
          month: 6,
          month_content: "6 meses",
          screen: [
            createPlanItem(18, 6, "6 meses", 1, 1, "1 perfil", "Individual", 1181, 5, 85.99, 69.99),
            createPlanItem(18, 6, "6 meses", 2, 4, "4 perfiles", "Familiar", 1182, 6, 125.99, 105.99)
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
            createPlanItem(1, 1, "1 mes", 1, 1, "1 perfil", "Individual", 1011, 1, 15.49, 12.99),
            createPlanItem(15, 3, "3 meses", 1, 1, "1 perfil", "Individual", 1151, 3, 45.00, 35.99),
            createPlanItem(18, 6, "6 meses", 1, 1, "1 perfil", "Individual", 1181, 5, 85.99, 69.99)
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
            createPlanItem(1, 1, "1 mes", 2, 4, "4 perfiles", "Familiar", 1012, 2, 22.99, 19.99),
            createPlanItem(15, 3, "3 meses", 2, 4, "4 perfiles", "Familiar", 1152, 4, 65.99, 55.99),
            createPlanItem(18, 6, "6 meses", 2, 4, "4 perfiles", "Familiar", 1182, 6, 125.99, 105.99)
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

  // DISNEY+ - Convertido a soles con planes de 1 mes
  const disneyCreateDto = {
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

  try {
    // Crear Netflix
    console.log('🎬 Creando Netflix con precios en soles...');
    const netflixResult = await servicesService.createService(netflixCreateDto);
    if (netflixResult.code === 0) {
      console.log(`✅ Netflix creado exitosamente`);
    } else {
      console.log(`❌ Error creando Netflix: ${netflixResult.message}`);
    }

    // Crear Disney+
    console.log('🏰 Creando Disney+ con precios en soles...');
    const disneyResult = await servicesService.createService(disneyCreateDto);
    if (disneyResult.code === 0) {
      console.log(`✅ Disney+ creado exitosamente`);
    } else {
      console.log(`❌ Error creando Disney+: ${disneyResult.message}`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('💰 Todos los precios han sido convertidos a soles peruanos (PEN)');
    console.log('📊 Tipo de cambio aplicado: 1 USD = 3.75 PEN');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar seed
seedServices();
