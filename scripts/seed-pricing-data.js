const { MongoClient, ObjectId } = require('mongodb');

// Configuración de conexión
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-db';

// Script para poblar datos de ejemplo del sistema de pricing modular
async function seedPricingData() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');

    const db = client.db();
    
    // Obtener colecciones con nombres corregidos
    const servicesCollection = db.collection('services');
    const monthOptionsCollection = db.collection('service_month_options');
    const screenOptionsCollection = db.collection('service_screen_options');
    const plansCollection = db.collection('service_plans');

    // ID de servicio de Disney+
    const serviceId = new ObjectId('68903254d69fe657139074f2');
    
    // Verificar si el servicio existe
    const service = await servicesCollection.findOne({ _id: serviceId });
    if (!service) {
      throw new Error(`No se encontró el servicio con ID: ${serviceId}`);
    }
    console.log('🔍 Servicio encontrado:', service.name || 'Disney+');

    console.log('🧹 Limpiando datos existentes...');
    
    // Primero eliminar planes ya que dependen de las opciones
    const deletedPlans = await plansCollection.deleteMany({ serviceId });
    console.log(`- Planes eliminados: ${deletedPlans.deletedCount}`);
    
    // Luego eliminar opciones de mes y pantalla
    const deletedMonths = await monthOptionsCollection.deleteMany({ serviceId });
    console.log(`- Opciones de mes eliminadas: ${deletedMonths.deletedCount}`);
    
    const deletedScreens = await screenOptionsCollection.deleteMany({ serviceId });
    console.log(`- Opciones de pantalla eliminadas: ${deletedScreens.deletedCount}`);

    console.log('📅 Creando opciones de meses...');

    // Obtener el próximo month_id
    const lastMonthOption = await monthOptionsCollection.findOne({}, { sort: { month_id: -1 } });
    let nextMonthId = (lastMonthOption?.month_id || 0) + 1;

    // Crear opciones de meses
    const monthOptionsData = [
      {
        month_id: nextMonthId++,
        serviceId: serviceId,
        month: 1,
        month_content: '1 mes',
        sort: 1,
        is_default: true,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        month_id: nextMonthId++,
        serviceId: serviceId,
        month: 3,
        month_content: '3 meses',
        sort: 2,
        is_default: false,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const monthOptionsResult = await monthOptionsCollection.insertMany(monthOptionsData);
    console.log(`✅ Creadas ${monthOptionsResult.insertedCount} opciones de meses`);

    console.log('📺 Creando opciones de pantallas...');

    // Obtener el próximo screen_id
    const lastScreenOption = await screenOptionsCollection.findOne({}, { sort: { screen_id: -1 } });
    let nextScreenId = (lastScreenOption?.screen_id || 0) + 1;

    // Crear opciones de pantallas
    const screenOptionsData = [
      {
        screen_id: nextScreenId++,
        serviceId: serviceId,
        max_user: 1,
        substitute_recharge: 0,
        screen: 1,
        screen_content: '1 perfil',
        seat_type: 'Individual',
        sort: 1,
        is_default: true,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const screenOptionsResult = await screenOptionsCollection.insertMany(screenOptionsData);
    console.log(`✅ Creadas ${screenOptionsResult.insertedCount} opciones de pantallas`);

    console.log('💰 Creando planes de precios...');

    // Obtener el próximo type_plan_id
    const lastPlan = await plansCollection.findOne({}, { sort: { type_plan_id: -1 } });
    let nextPlanId = (lastPlan?.type_plan_id || 0) + 1;

    // Matriz de precios (en soles)
    const pricingMatrix = {
      1: {  // 1 mes
        1: { original: 9.99, sale: 7.99, discount: '20%' }   // 1 perfil
      },
      2: {  // 3 meses
        1: { original: 25.99, sale: 21.99, discount: '15%' }  // 1 perfil
      }
    };

    // Crear planes para cada combinación
    const plansData = [];
    
    for (let monthIdx = 0; monthIdx < monthOptionsData.length; monthIdx++) {
      for (let screenIdx = 0; screenIdx < screenOptionsData.length; screenIdx++) {
        const monthOption = monthOptionsData[monthIdx];
        const screenOption = screenOptionsData[screenIdx];
        const pricing = pricingMatrix[monthIdx + 1][screenIdx + 1];
        
        plansData.push({
          type_plan_id: nextPlanId++,
          serviceId: serviceId,
          month_id: monthOption.month_id,
          screen_id: screenOption.screen_id,
          plan_type: 'plan',
          currency_icon1: 'S/',
          currency_icon2: 'PEN',
          currency_show_type: 1,
          original_price: pricing.original.toString(),
          sale_price: pricing.sale.toString(),
          average_price: (pricing.sale / monthOption.month).toFixed(2),
          discount: pricing.discount,
          sort: monthOption.sort * 10 + screenOption.sort,
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    const plansResult = await plansCollection.insertMany(plansData);

    console.log('');
    console.log('📊 Resumen de datos creados:');
    console.log(`   📅 Opciones de meses: ${monthOptionsResult.insertedCount}`);
    console.log(`   📺 Opciones de pantallas: ${screenOptionsResult.insertedCount}`);
    console.log(`   💰 Planes de precios: ${plansResult.insertedCount}`);
    console.log(`   🎯 Combinaciones totales: ${monthOptionsResult.insertedCount * screenOptionsResult.insertedCount}`);

    console.log('');
    console.log('✨ Datos de prueba creados exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
seedPricingData().catch(console.error);
