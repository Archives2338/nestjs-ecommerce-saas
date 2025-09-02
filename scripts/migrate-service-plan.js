const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-db';

async function migrateServicePlans(serviceIdStr) {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db();

    const servicesCollection = db.collection('services');
    const monthOptionsCollection = db.collection('service_month_options');
    const screenOptionsCollection = db.collection('service_screen_options');
    const plansCollection = db.collection('service_plans');

    const serviceId = new ObjectId(serviceIdStr);

    // 1. Obtener opciones de mes y pantalla
    const months = await monthOptionsCollection.find({ serviceId }).sort({ sort: 1, month: 1 }).toArray();
    const screens = await screenOptionsCollection.find({ serviceId }).sort({ sort: 1, screen: 1 }).toArray();
    const plans = await plansCollection.find({ serviceId }).toArray();

    // 2. Reconstruir estructura 'plan'
    const monthArray = months.map(month => ({
      month_id: month.month_id,
      month: month.month,
      month_content: month.month_content,
      screen: screens.map(screen => {
        const plan = plans.find(p => p.month_id === month.month_id && p.screen_id === screen.screen_id);
        if (!plan) return null;
        return {
          month_id: month.month_id,
          month: month.month,
          month_content: month.month_content,
          screen_id: screen.screen_id,
          max_user: screen.max_user,
          substitute_recharge: screen.substitute_recharge,
          screen: screen.screen,
          screen_content: screen.screen_content,
          seat_type: screen.seat_type,
          type_plan_id: plan.type_plan_id,
          sort: plan.sort,
          currency_icon1: plan.currency_icon1,
          currency_icon2: plan.currency_icon2,
          currency_show_type: plan.currency_show_type,
          original_price: plan.original_price,
          sale_price: plan.sale_price,
          average_price: plan.average_price,
          discount: plan.discount,
          active: plan.active
        };
      }).filter(Boolean)
    }));

    const screenArray = screens.map(screen => ({
      screen_id: screen.screen_id,
      max_user: screen.max_user,
      substitute_recharge: screen.substitute_recharge,
      screen: screen.screen,
      screen_content: screen.screen_content,
      seat_type: screen.seat_type,
      sort: screen.sort,
      month: months.map(month => {
        const plan = plans.find(p => p.month_id === month.month_id && p.screen_id === screen.screen_id);
        if (!plan) return null;
        return {
          month_id: month.month_id,
          month: month.month,
          month_content: month.month_content,
          screen_id: screen.screen_id,
          max_user: screen.max_user,
          substitute_recharge: screen.substitute_recharge,
          screen: screen.screen,
          screen_content: screen.screen_content,
          seat_type: screen.seat_type,
          type_plan_id: plan.type_plan_id,
          sort: plan.sort,
          currency_icon1: plan.currency_icon1,
          currency_icon2: plan.currency_icon2,
          currency_show_type: plan.currency_show_type,
          original_price: plan.original_price,
          sale_price: plan.sale_price,
          average_price: plan.average_price,
          discount: plan.discount,
          active: plan.active
        };
      }).filter(Boolean)
    }));

    // 3. Defaults
    const default_month_id = months.find(m => m.is_default)?.month_id || months[0]?.month_id;
    const default_screen_id = screens.find(s => s.is_default)?.screen_id || screens[0]?.screen_id;

    // 4. Actualizar el servicio
    const result = await servicesCollection.updateOne(
      { _id: serviceId },
      {
        $set: {
          plan: {
            month: monthArray,
            screen: screenArray,
            default_month_id,
            default_screen_id
          }
        }
      }
    );

    console.log(`✅ Migración completada para el servicio ${serviceIdStr}. Modificados: ${result.modifiedCount}`);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await client.close();
  }
}

// Ejemplo de uso: node migrate-service-plan.js 6890338de0d809557a9ef52a
if (require.main === module) {
  const serviceIdArg = process.argv[2];
  if (!serviceIdArg) {
    console.error('❗ Debes indicar el Service ID como argumento');
    process.exit(1);
  }
  migrateServicePlans(serviceIdArg);
}