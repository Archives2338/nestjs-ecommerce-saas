import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ServicesService } from '../services/services.service';
import { CurrencyConverter } from '../utils/currency-converter';

/**
 * Script de seed para servicios de streaming
 * 
 * NOTA: Esta implementación usa estructura embebida para planes.
 * Ver ROADMAP.md - Fase 2 para migración hacia arquitectura dinámica
 * con month_id y screen_id independientes.
 * 
 * ACTUALIZADO: Precios convertidos a PEN (Soles peruanos)
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
    console.log('🌟 Iniciando seed de servicios...');

    // Crear Netflix usando el servicio
    const netflixResult = await servicesService.createService(netflixCreateDto);
    
    if (netflixResult.code === 0) {
      console.log('✅ Netflix service created successfully');
    } else {
      console.log('❌ Error creating Netflix service:', netflixResult.message);
    }

    // Datos de Disney+ (con precios optimizados en soles peruanos)
    const disneyCreateDto = {
      language: "es",
      type_id: 10,
      name: "Disney+",
      subtitle: "El hogar de Disney, Marvel, Star Wars y más",
      content: "Acceso completo a Disney+ con contenido 4K HDR y Dolby Vision",
      icon: "https://static.gamsgocdn.com/image/dc3267eba3a0779df555d940a2a9eed9.webp",
      type: 1,
      plan: {
        month: [
          {
            month_id: 1,
            month: 1,
            month_content: "1 mes",
            screen: [
              {
                month_id: 1,
                month: 1,
                month_content: "1 mes",
                screen_id: 85,
                max_user: 1,
                substitute_recharge: 0,
                screen: 1,
                screen_content: "1 perfil",
                seat_type: "Personal",
                type_plan_id: 355,
                sort: 7,
                currency_icon1: "S/",
                currency_icon2: "PEN(S/)",
                currency_show_type: 1,
                original_price: "15.00",
                sale_price: "8.90",
                average_price: "8.90",
                discount: "0.4067"
              }
            ]
          },
          {
            month_id: 3,
            month: 3,
            month_content: "3 meses",
            screen: [
              {
                month_id: 3,
                month: 3,
                month_content: "3 meses",
                screen_id: 85,
                max_user: 1,
                substitute_recharge: 0,
                screen: 1,
                screen_content: "1 perfil",
                seat_type: "Personal",
                type_plan_id: 356,
                sort: 7,
                currency_icon1: "S/",
                currency_icon2: "PEN(S/)",
                currency_show_type: 1,
                original_price: "45.00",
                sale_price: "24.90",
                average_price: "8.30",
                discount: "0.4467"
              }
            ]
          }
        ],
        screen: [
          {
            screen_id: 85,
            max_user: 1,
            substitute_recharge: 0,
            screen: 1,
            screen_content: "1 perfil",
            seat_type: "Personal",
            sort: 7,
            month: [
              {
                month_id: 1,
                month: 1,
                month_content: "1 mes",
                screen_id: 85,
                max_user: 1,
                substitute_recharge: 0,
                screen: 1,
                screen_content: "1 perfil",
                seat_type: "Personal",
                type_plan_id: 355,
                sort: 7,
                currency_icon1: "S/",
                currency_icon2: "PEN(S/)",
                currency_show_type: 1,
                original_price: "15.00",
                sale_price: "8.90",
                average_price: "8.90",
                discount: "0.4067"
              },
              {
                month_id: 3,
                month: 3,
                month_content: "3 meses",
                screen_id: 85,
                max_user: 1,
                substitute_recharge: 0,
                screen: 1,
                screen_content: "1 perfil",
                seat_type: "Personal",
                type_plan_id: 356,
                sort: 7,
                currency_icon1: "S/",
                currency_icon2: "PEN(S/)",
                currency_show_type: 1,
                original_price: "45.00",
                sale_price: "24.90",
                average_price: "8.30",
                discount: "0.4467"
              }
            ]
          }
        ],
        default_month_id: 1,
        default_screen_id: 85
      },
      repayment: {
        month: [
          {
            month_id: 1,
            month: 1,
            month_content: "1 mes",
            screen: [
              {
                month_id: 1,
                month: 1,
                month_content: "1 mes",
                screen_id: 85,
                max_user: 1,
                substitute_recharge: 0,
                screen: 1,
                screen_content: "1 perfil",
                seat_type: "Personal",
                type_plan_id: 355,
                sort: 7,
                currency_icon1: "S/",
                currency_icon2: "PEN(S/)",
                currency_show_type: 1,
                original_price: "15.00",
                sale_price: "8.50",
                average_price: "8.50",
                discount: "0.4333"
              }
            ]
          }
        ],
        screen: [
          {
            screen_id: 85,
            max_user: 1,
            substitute_recharge: 0,
            screen: 1,
            screen_content: "1 perfil",
            seat_type: "Personal",
            sort: 7,
            month: [
              {
                month_id: 1,
                month: 1,
                month_content: "1 mes",
                screen_id: 85,
                max_user: 1,
                substitute_recharge: 0,
                screen: 1,
                screen_content: "1 perfil",
                seat_type: "Personal",
                type_plan_id: 355,
                sort: 7,
                currency_icon1: "S/",
                currency_icon2: "PEN(S/)",
                currency_show_type: 1,
                original_price: "15.00",
                sale_price: "8.50",
                average_price: "8.50",
                discount: "0.4333"
              }
            ]
          }
        ],
        default_month_id: 1,
        default_screen_id: 85
      },
      sort: 2,
      active: true
    };

    // Crear Disney+ usando el servicio  
    const disneyResult = await servicesService.createService(disneyCreateDto);
    
    if (disneyResult.code === 0) {
      console.log('✅ Disney+ service created successfully');
    } else {
      console.log('❌ Error creating Disney+ service:', disneyResult.message);
    }

    console.log('🎉 Servicios de ejemplo creados exitosamente');
    console.log('📊 Resumen:');
    console.log('  • Netflix: Precios en USD');
    console.log('  • Disney+: Precios en SOLES PERUANOS (S/)');

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
