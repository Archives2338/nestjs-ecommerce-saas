const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

async function migrateUserOrdersToOrders() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db();
    const userOrdersCollection = db.collection('user_orders');
    const ordersCollection = db.collection('orders');
    
    // Obtener todos los UserOrders
    const userOrders = await userOrdersCollection.find({}).toArray();
    console.log(`Encontrados ${userOrders.length} UserOrders para migrar`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const userOrder of userOrders) {
      try {
        // Verificar si ya existe en orders
        const existingOrder = await ordersCollection.findOne({ 
          out_trade_no: userOrder.order_number 
        });
        
        if (existingOrder) {
          // Si existe, actualizar con información de UserOrder
          await ordersCollection.updateOne(
            { _id: existingOrder._id },
            {
              $set: {
                user_id: userOrder.user_id,
                order_status: mapOrderStatus(userOrder.status),
                service_name: userOrder.purchase_info?.service_name,
                plan_name: userOrder.purchase_info?.plan_name,
                duration_months: userOrder.purchase_info?.duration_months,
                max_users: userOrder.purchase_info?.max_users,
                starts_at: userOrder.starts_at,
                expires_at: userOrder.expires_at,
                access_info: userOrder.access_info,
                payment_info: userOrder.payment_info,
                updatedAt: new Date()
              }
            }
          );
          console.log(`✅ Actualizada orden existente: ${userOrder.order_number}`);
        } else {
          // Si no existe, crear nueva orden
          const newOrder = {
            customer: userOrder.user_id, // Usar user_id como customer por ahora
            user_id: userOrder.user_id,
            out_trade_no: userOrder.order_number,
            items: [{
              productId: userOrder.purchase_info?.service_id?.toString() || '1',
              name: userOrder.purchase_info?.service_name || 'Servicio',
              quantity: 1,
              price: parseFloat(userOrder.purchase_info?.paid_price || '0'),
              duration: `${userOrder.purchase_info?.duration_months || 1} meses`,
              profiles: userOrder.purchase_info?.max_users || 1
            }],
            total: parseFloat(userOrder.purchase_info?.paid_price || '0'),
            service: userOrder.purchase_info?.service_id || 1,
            type_id: userOrder.purchase_info?.service_id || 1,
            type_plan_id: userOrder.purchase_info?.plan_id || 1,
            service_name: userOrder.purchase_info?.service_name || 'Servicio',
            plan_name: userOrder.purchase_info?.plan_name || 'Plan',
            duration_months: userOrder.purchase_info?.duration_months || 1,
            max_users: userOrder.purchase_info?.max_users || 1,
            order_status: mapOrderStatus(userOrder.status),
            ostatus: mapLegacyStatus(userOrder.status),
            starts_at: userOrder.starts_at,
            expires_at: userOrder.expires_at,
            access_info: userOrder.access_info,
            payment_info: userOrder.payment_info,
            // Campos adicionales requeridos por Order
            product_id: userOrder.purchase_info?.service_id || 1,
            service_id: userOrder.purchase_info?.service_id || 1,
            substitute_recharge_id: 0,
            number: 1,
            screen: userOrder.purchase_info?.max_users || 1,
            payment_id: getPaymentMethodId(userOrder.payment_info?.payment_method),
            currency: userOrder.purchase_info?.currency || 'PEN',
            otype: 1,
            renew: 0,
            renew_type: 0,
            total_price: userOrder.purchase_info?.paid_price || '0.00',
            original_price: userOrder.purchase_info?.original_price || '0.00',
            payment_fee: '0.00',
            payment_rate: '0%',
            refund_status: 0,
            coupon_discount: '0.00',
            promo_code_discount: '0.00',
            auto_renewal_discount: '0.00',
            country_code: 'PE',
            username: '',
            createdAt: userOrder.created_at || new Date(),
            updatedAt: userOrder.updated_at || new Date()
          };
          
          await ordersCollection.insertOne(newOrder);
          console.log(`✅ Creada nueva orden: ${userOrder.order_number}`);
        }
        
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrando ${userOrder.order_number}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Resumen de migración:`);
    console.log(`✅ Migradas exitosamente: ${migratedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📦 Total procesadas: ${userOrders.length}`);
    
    // Crear backup de user_orders antes de eliminar
    if (migratedCount > 0) {
      console.log('\n💾 Creando backup de user_orders...');
      await db.collection('user_orders_backup').insertMany(userOrders);
      console.log('✅ Backup creado en user_orders_backup');
      
      // Opcional: Eliminar user_orders original (comentado por seguridad)
      // await userOrdersCollection.drop();
      // console.log('🗑️ Colección user_orders eliminada');
    }
    
  } catch (error) {
    console.error('Error en migración:', error);
  } finally {
    await client.close();
    console.log('Desconectado de MongoDB');
  }
}

function mapOrderStatus(userOrderStatus) {
  const statusMap = {
    'pending': 'pending',
    'active': 'active',
    'expired': 'expired',
    'cancelled': 'cancelled',
    'suspended': 'suspended'
  };
  return statusMap[userOrderStatus] || 'pending';
}

function mapLegacyStatus(userOrderStatus) {
  const statusMap = {
    'pending': 1,
    'active': 2,
    'expired': 4,
    'cancelled': 5,
    'suspended': 3
  };
  return statusMap[userOrderStatus] || 1;
}

function getPaymentMethodId(method) {
  if (!method) return 1;
  const methodMap = {
    'yape': 1,
    'plin': 2,
    'transferencia': 3
  };
  return methodMap[method.toLowerCase()] || 1;
}

// Ejecutar migración
if (require.main === module) {
  migrateUserOrdersToOrders()
    .then(() => {
      console.log('🎉 Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateUserOrdersToOrders };
