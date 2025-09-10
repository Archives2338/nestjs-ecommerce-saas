const mongoose = require('mongoose');

console.log('🔄 MIGRACIÓN: Convirtiendo catálogo de type_id a ObjectId...');
mongoose.connect('mongodb://localhost:27017/ecommerce-db')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // 1. Obtener el servicio real
    const Service = mongoose.model('Service', new mongoose.Schema({}, { strict: false }));
    const services = await Service.find({});
    
    console.log('📊 Servicios encontrados en DB:');
    services.forEach((service, index) => {
      console.log(`  ${index + 1}. ObjectId: ${service._id}`);
      console.log(`     type_id: ${service.type_id}`);
      console.log(`     name: ${service.type_name || 'Sin nombre'}`);
      console.log('');
    });
    
    if (services.length === 0) {
      console.log('❌ No hay servicios en la base de datos');
      await mongoose.disconnect();
      return;
    }
    
    // 2. Obtener el catálogo
    const Catalog = mongoose.model('Catalog', new mongoose.Schema({}, { strict: false }));
    const catalog = await Catalog.findOne({ language: 'es' });
    
    if (!catalog) {
      console.log('❌ No se encontró catálogo en español');
      await mongoose.disconnect();
      return;
    }
    
    console.log('📋 Catálogo actual:');
    let totalServices = 0;
    catalog.list.forEach((category, catIndex) => {
      console.log(`  Categoría ${catIndex + 1}: ${category.id}`);
      category.spuList.forEach((spu, spuIndex) => {
        totalServices++;
        console.log(`    ${spuIndex + 1}. type_id: ${spu.id || 'N/A'}`);
        console.log(`       serviceRef: ${spu.serviceRef || 'N/A'}`);
        console.log(`       name: ${spu.type_name}`);
      });
    });
    
    console.log(`\n📊 Total servicios en catálogo: ${totalServices}`);
    
    // 3. Plan de migración
    console.log('\n🔄 PLAN DE MIGRACIÓN:');
    let migrationPlan = [];
    
    for (const category of catalog.list) {
      for (const spu of category.spuList) {
        // Buscar servicio correspondiente
        const matchingService = services.find(s => 
          s.type_id === spu.id || 
          s._id.toString() === (spu.serviceRef || '').toString()
        );
        
        if (matchingService) {
          migrationPlan.push({
            action: 'UPDATE',
            catalogService: spu.type_name,
            currentTypeId: spu.id,
            currentServiceRef: spu.serviceRef,
            newServiceId: matchingService._id.toString(),
            serviceMatch: 'FOUND'
          });
        } else {
          migrationPlan.push({
            action: 'DELETE',
            catalogService: spu.type_name,
            currentTypeId: spu.id,
            currentServiceRef: spu.serviceRef,
            serviceMatch: 'NOT_FOUND'
          });
        }
      }
    }
    
    migrationPlan.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.action}: ${plan.catalogService}`);
      console.log(`     Current type_id: ${plan.currentTypeId}`);
      console.log(`     Current serviceRef: ${plan.currentServiceRef || 'N/A'}`);
      if (plan.action === 'UPDATE') {
        console.log(`     New serviceId: ${plan.newServiceId}`);
      }
      console.log(`     Status: ${plan.serviceMatch}`);
      console.log('');
    });
    
    const toUpdate = migrationPlan.filter(p => p.action === 'UPDATE').length;
    const toDelete = migrationPlan.filter(p => p.action === 'DELETE').length;
    
    console.log(`📊 RESUMEN:`);
    console.log(`   ✅ Servicios a actualizar: ${toUpdate}`);
    console.log(`   🗑️ Servicios a eliminar: ${toDelete}`);
    console.log(`   📈 Servicios finales: ${toUpdate}`);
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    console.log('\n💡 Para ejecutar la migración, ejecuta: node migrate-to-objectid.js');
    
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
