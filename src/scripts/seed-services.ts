import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ServicesService } from '../services/services.service';

/**
 * Script de seed para servicios de streaming
 * 
 * NOTA: Esta implementación usa estructura embebida para planes.
 * Ver ROADMAP.md - Fase 2 para migración hacia arquitectura dinámica
 * con month_id y screen_id independientes.
 */

async function seedServices() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const servicesService = app.get(ServicesService);

  // Datos de Netflix (basados en la respuesta de ejemplo)
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
          month_id: 15,
          month: 3,
          month_content: "3 meses",
          screen: [
            {
              month_id: 15,
              month: 3,
              month_content: "3 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 257,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "59.97",
              sale_price: "14.49",
              average_price: "4.83",
              discount: "0.7584"
            },
            {
              month_id: 15,
              month: 3,
              month_content: "3 meses",
              screen_id: 67,
              max_user: 5,
              substitute_recharge: 0,
              screen: 5,
              screen_content: "5 perfiles",
              seat_type: "Privado",
              type_plan_id: 258,
              sort: 8,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "69.99",
              sale_price: "59.97",
              average_price: "19.99",
              discount: "0.1432"
            }
          ]
        },
        {
          month_id: 18,
          month: 6,
          month_content: "6 meses",
          screen: [
            {
              month_id: 18,
              month: 6,
              month_content: "6 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 260,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "119.94",
              sale_price: "28.49",
              average_price: "4.75",
              discount: "0.7625"
            },
            {
              month_id: 18,
              month: 6,
              month_content: "6 meses",
              screen_id: 67,
              max_user: 5,
              substitute_recharge: 0,
              screen: 5,
              screen_content: "5 perfiles",
              seat_type: "Privado",
              type_plan_id: 270,
              sort: 8,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "120.00",
              sale_price: "108.77",
              average_price: "18.13",
              discount: "0.0936"
            }
          ]
        },
        {
          month_id: 24,
          month: 12,
          month_content: "12 meses",
          screen: [
            {
              month_id: 24,
              month: 12,
              month_content: "12 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 265,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "239.88",
              sale_price: "55.77",
              average_price: "4.65",
              discount: "0.7675"
            },
            {
              month_id: 24,
              month: 12,
              month_content: "12 meses",
              screen_id: 67,
              max_user: 5,
              substitute_recharge: 0,
              screen: 5,
              screen_content: "5 perfiles",
              seat_type: "Privado",
              type_plan_id: 271,
              sort: 8,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "240.00",
              sale_price: "189.99",
              average_price: "15.83",
              discount: "0.2084"
            }
          ]
        }
      ],
      screen: [
        {
          screen_id: 66,
          max_user: 5,
          substitute_recharge: 0,
          screen: 1,
          screen_content: "1 perfil (Mejor relación calidad-precio)",
          seat_type: "Compartido",
          sort: 5,
          month: [
            {
              month_id: 15,
              month: 3,
              month_content: "3 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 257,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "59.97",
              sale_price: "14.49",
              average_price: "4.83",
              discount: "0.7584"
            },
            {
              month_id: 18,
              month: 6,
              month_content: "6 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 260,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "119.94",
              sale_price: "28.49",
              average_price: "4.75",
              discount: "0.7625"
            },
            {
              month_id: 24,
              month: 12,
              month_content: "12 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 265,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "239.88",
              sale_price: "55.77",
              average_price: "4.65",
              discount: "0.7675"
            }
          ]
        },
        {
          screen_id: 67,
          max_user: 5,
          substitute_recharge: 0,
          screen: 5,
          screen_content: "5 perfiles",
          seat_type: "Privado",
          sort: 8,
          month: [
            {
              month_id: 15,
              month: 3,
              month_content: "3 meses",
              screen_id: 67,
              max_user: 5,
              substitute_recharge: 0,
              screen: 5,
              screen_content: "5 perfiles",
              seat_type: "Privado",
              type_plan_id: 258,
              sort: 8,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "69.99",
              sale_price: "59.97",
              average_price: "19.99",
              discount: "0.1432"
            },
            {
              month_id: 18,
              month: 6,
              month_content: "6 meses",
              screen_id: 67,
              max_user: 5,
              substitute_recharge: 0,
              screen: 5,
              screen_content: "5 perfiles",
              seat_type: "Privado",
              type_plan_id: 270,
              sort: 8,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "120.00",
              sale_price: "108.77",
              average_price: "18.13",
              discount: "0.0936"
            },
            {
              month_id: 24,
              month: 12,
              month_content: "12 meses",
              screen_id: 67,
              max_user: 5,
              substitute_recharge: 0,
              screen: 5,
              screen_content: "5 perfiles",
              seat_type: "Privado",
              type_plan_id: 271,
              sort: 8,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "240.00",
              sale_price: "189.99",
              average_price: "15.83",
              discount: "0.2084"
            }
          ]
        }
      ],
      default_month_id: 15,
      default_screen_id: 66
    },
    repayment: {
      month: [
        {
          month_id: 15,
          month: 3,
          month_content: "3 meses",
          screen: [
            {
              month_id: 15,
              month: 3,
              month_content: "3 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 257,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "59.97",
              sale_price: "13.59",
              average_price: "4.53",
              discount: "0.7734"
            },
            {
              month_id: 15,
              month: 3,
              month_content: "3 meses",
              screen_id: 67,
              max_user: 5,
              substitute_recharge: 0,
              screen: 5,
              screen_content: "5 perfiles",
              seat_type: "Privado",
              type_plan_id: 258,
              sort: 8,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "69.99",
              sale_price: "58.97",
              average_price: "19.66",
              discount: "0.1575"
            }
          ]
        }
      ],
      screen: [
        {
          screen_id: 66,
          max_user: 5,
          substitute_recharge: 0,
          screen: 1,
          screen_content: "1 perfil (Mejor relación calidad-precio)",
          seat_type: "Compartido",
          sort: 5,
          month: [
            {
              month_id: 15,
              month: 3,
              month_content: "3 meses",
              screen_id: 66,
              max_user: 5,
              substitute_recharge: 0,
              screen: 1,
              screen_content: "1 perfil (Mejor relación calidad-precio)",
              seat_type: "Compartido",
              type_plan_id: 257,
              sort: 5,
              currency_icon1: "$",
              currency_icon2: "USD($)",
              currency_show_type: 1,
              original_price: "59.97",
              sale_price: "13.59",
              average_price: "4.53",
              discount: "0.7734"
            }
          ]
        }
      ],
      default_month_id: 15,
      default_screen_id: 66
    },
    sort: 1,
    active: true
  };

  try {
    console.log('� Iniciando seed de servicios...');

    // Crear Netflix usando el servicio
    const result = await servicesService.createService(netflixCreateDto);
    
    if (result.code === 0) {
      console.log('✅ Netflix service created successfully');
    } else {
      console.log('❌ Error creating Netflix service:', result.message);
    }

    console.log('🎉 Servicios de ejemplo creados exitosamente');

  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar el script
if (require.main === module) {
  seedServices();
}
