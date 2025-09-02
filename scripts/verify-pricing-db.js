const { MongoClient, ObjectId } = require('mongodb');

// Configuración de conexión
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-db';

async function verifyPricingData() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB para verificación');

    const db = client.db();
    
    // Obtener colecciones
    const monthOptionsCollection = db.collection('servicemonthoptions');
    const screenOptionsCollection = db.collection('servicescreenoptions');
    const plansCollection = db.collection('serviceplans');

    const serviceId = new ObjectId('68903254d69fe657139074f2');

    console.log('');
    console.log('📅 Verificando opciones de meses...');
    
    const monthOptions = await monthOptionsCollection.find({ serviceId }).toArray();
    console.log(`✅ Encontradas ${monthOptions.length} opciones de meses:`);
    
    monthOptions.forEach(option => {
      console.log(`   📅 ${option.month} mes(es) - "${option.month_content}" (ID: ${option.month_id}) ${option.is_default ? '🔥 DEFAULT' : ''}`);
    });

    console.log('');
    console.log('📺 Verificando opciones de pantallas...');
    
    const screenOptions = await screenOptionsCollection.find({ serviceId }).toArray();
    console.log(`✅ Encontradas ${screenOptions.length} opciones de pantallas:`);
    
    screenOptions.forEach(option => {
      console.log(`   🖥️ ${option.screen} pantalla(s) - "${option.screen_content}" (ID: ${option.screen_id}) - ${option.max_user} usuarios ${option.is_default ? '🔥 DEFAULT' : ''}`);
    });

    console.log('');
    console.log('💰 Verificando planes de precios...');
    
    const pricingPlans = await plansCollection.find({ serviceId }).toArray();
    console.log(`✅ Encontrados ${pricingPlans.length} planes de precios:`);
    
    pricingPlans.forEach(plan => {
      console.log(`   💳 Plan ${plan.type_plan_id}: Mes ID ${plan.month_id} + Pantalla ID ${plan.screen_id} = ${plan.currency_icon1}${plan.sale_price} (${plan.discount} desc.)`);
    });

    console.log('');
    console.log('📊 Resumen de verificación:');
    console.log(`   📅 Opciones de meses: ${monthOptions.length}`);
    console.log(`   📺 Opciones de pantallas: ${screenOptions.length}`);
    console.log(`   💰 Planes de precios: ${pricingPlans.length}`);
    console.log(`   🎯 Combinaciones esperadas: ${monthOptions.length * screenOptions.length}`);
    console.log(`   🎯 Combinaciones encontradas: ${pricingPlans.length}`);

    const expectedCombinations = monthOptions.length * screenOptions.length;
    
    if (pricingPlans.length === expectedCombinations && pricingPlans.length > 0) {
      console.log('   ✅ ¡Perfecto! Todos los datos están correctos');
    } else if (pricingPlans.length > 0) {
      console.log('   ⚠️ Hay datos pero pueden estar incompletos');
    } else {
      console.log('   ❌ No se encontraron datos');
    }

    console.log('');
    console.log('🎯 Matriz de precios verificada:');
    
    // Crear matriz visual
    const monthsMap = {};
    const screensMap = {};
    
    monthOptions.forEach(m => monthsMap[m.month_id] = m.month);
    screenOptions.forEach(s => screensMap[s.screen_id] = s.screen);
    
    console.log('');
    console.log('   📊 Precios por combinación:');
    
    for (const monthOption of monthOptions) {
      for (const screenOption of screenOptions) {
        const plan = pricingPlans.find(p => p.month_id === monthOption.month_id && p.screen_id === screenOption.screen_id);
        if (plan) {
          console.log(`   💳 ${monthOption.month} mes(es) + ${screenOption.screen} pantalla(s): ${plan.currency_icon1}${plan.sale_price} (${plan.discount})`);
        } else {
          console.log(`   ❌ FALTA: ${monthOption.month} mes(es) + ${screenOption.screen} pantalla(s)`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  } finally {
    await client.close();
    console.log('');
    console.log('🔗 Desconectado de MongoDB');
  }
}

// Ejecutar verificación
if (require.main === module) {
  verifyPricingData()
    .then(() => {
      console.log('🎉 Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en verificación:', error);
      process.exit(1);
    });
}

module.exports = { verifyPricingData };
