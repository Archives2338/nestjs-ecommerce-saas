import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { Logger } from '@nestjs/common';

/**
 * Script para generar órdenes de ejemplo en la base de datos
 * Ejecutar con: npm run build && node dist/scripts/seed-orders.js
 */
async function seedOrders() {
  const logger = new Logger('SeedOrders');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const ordersService = app.get(OrdersService);

    // Cliente de ejemplo (usar uno existente o crear uno)
    const customerId = '673a5299e2f1234567890123'; // ID de ejemplo

    // Órdenes de ejemplo
    const sampleOrders: CreateOrderDto[] = [
      {
        // Orden Netflix completada
        serviceId: '673a5299e2f1234567890111', // Netflix
        items: [{
          productId: 'netflix-1-profile',
          name: 'Netflix 1 Perfil',
          quantity: 1,
          price: 17.00,
          duration: '1 mes',
          profiles: 1
        }],
        total: 17.00,
        paymentMethod: 'yape',
        type_plan_id: 1,
        promo_code: ''
      },
      {
        // Orden Netflix 4 perfiles completada
        serviceId: '673a5299e2f1234567890111', // Netflix
        items: [{
          productId: 'netflix-4-profiles',
          name: 'Netflix 4 Perfiles',
          quantity: 1,
          price: 54.99,
          duration: '1 mes',
          profiles: 4
        }],
        total: 54.99,
        paymentMethod: 'plin',
        type_plan_id: 2,
        promo_code: ''
      },
      {
        // Orden Spotify cancelada
        serviceId: '673a5299e2f1234567890222', // Spotify
        items: [{
          productId: 'spotify-premium',
          name: 'Spotify Premium',
          quantity: 1,
          price: 9.99,
          duration: '1 mes',
          profiles: 1
        }],
        total: 9.99,
        paymentMethod: 'transferencia',
        type_plan_id: 1,
        promo_code: 'DESCUENTO10'
      }
    ];

    logger.log('Iniciando creación de órdenes de ejemplo...');

    // Crear las órdenes
    for (let i = 0; i < sampleOrders.length; i++) {
      try {
        const order = await ordersService.createOrder(sampleOrders[i], customerId);
        logger.log(`✅ Orden ${i + 1} creada: ${order.out_trade_no}`);

        // Simular diferentes estados
        if (i === 0) {
          // Primera orden: completada
          await ordersService.updateOrderStatus(order._id.toString(), { status: 'pagado' });
          logger.log(`   🔄 Estado actualizado a: pagado`);
        } else if (i === 2) {
          // Tercera orden: cancelada
          await ordersService.updateOrderStatus(order._id.toString(), { status: 'cancelado' });
          logger.log(`   🔄 Estado actualizado a: cancelado`);
        }
        // Segunda orden queda en pendiente

      } catch (error) {
        logger.error(`❌ Error creando orden ${i + 1}:`, (error as Error).message);
      }
    }

    logger.log('✅ Proceso de seeding completado');

    // Verificar las órdenes creadas
    const orderHistory = await ordersService.getOrderHistory(customerId, {}, 1, 10);
    logger.log(`📊 Total de órdenes en la base de datos: ${orderHistory.total}`);

    const orderStats = await ordersService.getOrderStatistics(customerId);
    logger.log('📈 Estadísticas de órdenes:', orderStats);

    await app.close();

  } catch (error) {
    logger.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedOrders()
    .then(() => {
      console.log('🎉 Seeding completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en seeding:', error);
      process.exit(1);
    });
}

export { seedOrders };
