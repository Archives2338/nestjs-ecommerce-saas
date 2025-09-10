const mongoose = require('mongoose');

console.log('🔍 Conectando a MongoDB (ecommerce-db)...');
mongoose.connect('mongodb://localhost:27017/ecommerce-db')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // Consultar catálogo con nuevo formato
    const Catalog = mongoose.model('Catalog', new mongoose.Schema({}, { strict: false }));
    const catalog = await Catalog.findOne({ language: 'es' });
    
    if (!catalog) {
      console.log('❌ No se encontró catálogo en español');
      await mongoose.disconnect();
      return;
    }
    
    console.log('📋 CATÁLOGO POST-MIGRACIÓN:');
    console.log('Language:', catalog.language);
    console.log('Total categorías:', catalog.list.length);
    console.log('='.repeat(60));
    
    let totalServicesInCatalog = 0;
    catalog.list.forEach((category, catIndex) => {
      console.log(`\n🏷️ Categoría ${catIndex + 1}: ${category.id} - ${category.type_name}`);
      console.log(`   📦 Servicios en esta categoría: ${category.spuList.length}`);
      
      category.spuList.forEach((spu, spuIndex) => {
        totalServicesInCatalog++;
        console.log(`     ${spuIndex + 1}. 🆔 serviceId: ${spu.serviceId || 'N/A'}`);
        console.log(`        📋 type_id: ${spu.type_id || spu.id || 'N/A'}`);
        console.log(`        🏷️ Name: ${spu.type_name}`);
        console.log(`        💰 Price: ${spu.min_price || 'No price'}`);
        console.log(`        🔗 serviceRef: ${spu.serviceRef || 'N/A'}`);
        console.log(`        📊 Status: ${spu.serviceId ? '✅ Migrado' : '❌ No migrado'}`);
        console.log('        ' + '-'.repeat(40));
      });
    });
    
    console.log(`\n📊 RESUMEN POST-MIGRACIÓN:`);
    console.log(`   🔢 TOTAL SERVICIOS EN CATÁLOGO: ${totalServicesInCatalog}`);
    
    // Contar servicios migrados vs no migrados
    let migrated = 0;
    let notMigrated = 0;
    catalog.list.forEach(category => {
      category.spuList.forEach(spu => {
        if (spu.serviceId) {
          migrated++;
        } else {
          notMigrated++;
        }
      });
    });
    
    console.log(`   ✅ SERVICIOS MIGRADOS (con serviceId): ${migrated}`);
    console.log(`   ❌ SERVICIOS NO MIGRADOS (sin serviceId): ${notMigrated}`);
    console.log(`   📈 ÉXITO DE MIGRACIÓN: ${((migrated / totalServicesInCatalog) * 100).toFixed(1)}%`);
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
