const mongoose = require('mongoose');

console.log('🔍 Conectando a MongoDB (ecommerce-db)...');
mongoose.connect('mongodb://localhost:27017/ecommerce-db')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // Consultar catálogo
    const Catalog = mongoose.model('Catalog', new mongoose.Schema({}, { strict: false }));
    const catalog = await Catalog.findOne({ language: 'es' });
    
    if (!catalog) {
      console.log('❌ No se encontró catálogo en español');
      await mongoose.disconnect();
      return;
    }
    
    console.log('📋 CATÁLOGO ENCONTRADO:');
    console.log('Language:', catalog.language);
    console.log('Total categorías:', catalog.list.length);
    console.log('='.repeat(60));
    
    let totalServicesInCatalog = 0;
    catalog.list.forEach((category, catIndex) => {
      console.log(`\n🏷️ Categoría ${catIndex + 1}: ${category.id} - ${category.type_name}`);
      console.log(`   📦 Servicios en esta categoría: ${category.spuList.length}`);
      
      category.spuList.forEach((spu, spuIndex) => {
        totalServicesInCatalog++;
        console.log(`     ${spuIndex + 1}. 📋 ID: ${spu.id}`);
        console.log(`        🏷️ Name: ${spu.type_name}`);
        console.log(`        💰 Price: ${spu.min_price || 'No price'}`);
        console.log(`        🔗 ServiceRef: ${spu.serviceRef || 'NO_REF'}`);
        console.log('        ' + '-'.repeat(40));
      });
    });
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   🔢 TOTAL SERVICIOS EN CATÁLOGO: ${totalServicesInCatalog}`);
    console.log(`   🎯 SERVICIOS REALES EN DB: 1 (type_id: 1)`);
    console.log(`   ⚠️ DIFERENCIA: ${totalServicesInCatalog - 1} servicios huérfanos`);
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
