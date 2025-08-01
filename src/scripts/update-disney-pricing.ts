import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ServicesService } from '../services/services.service';
import { UpdateServiceDto } from '../services/dto/service.dto';

async function updateDisneyPricing() {
  console.log('🎬 Actualizando precios de Disney+...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const servicesService = app.get(ServicesService);

  try {
    // Configuración actualizada de Disney+ con nuevos precios
    const disneyUpdateDto: UpdateServiceDto = {
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

    // Actualizar Disney+ usando el servicio
    const result = await servicesService.updateService("es", 10, disneyUpdateDto);
    
    if (result.code === 0) {
      console.log('✅ Disney+ pricing updated successfully');
      console.log('💰 Nuevos precios:');
      console.log('   • 1 mes: S/ 8.90');
      console.log('   • 3 meses: S/ 24.90 (S/ 8.30/mes)');
      console.log('👤 Solo 1 perfil disponible');
    } else {
      console.log('❌ Error updating Disney+ pricing:', result.message);
    }

  } catch (error) {
    console.error('🚨 Error durante la actualización:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  updateDisneyPricing().catch(error => {
    console.error('🚨 Error fatal:', error);
    process.exit(1);
  });
}

export { updateDisneyPricing };
