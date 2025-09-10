const { MongoClient } = require('mongodb');

async function cleanCatalogDirectly() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB directamente');
    
    const db = client.db('ecommerce-db');
    
    // 1. Obtener servicios reales
    const servicesCollection = db.collection('services');
    const realServices = await servicesCollection.find({}).toArray();
    
    console.log('📊 Servicios reales encontrados:');
    realServices.forEach((service, index) => {
      console.log(`  ${index + 1}. ObjectId: ${service._id}`);
      console.log(`     type_id: ${service.type_id}`);
      console.log(`     name: ${service.type_name || 'Sin nombre'}`);
    });
    
    // 2. Obtener catálogo
    const catalogsCollection = db.collection('catalogs');
    const catalog = await catalogsCollection.findOne({ language: 'es' });
    
    if (!catalog) {
      console.log('❌ No se encontró catálogo');
      return;
    }
    
    console.log('\n📋 Estado actual del catálogo:');
    let totalBeforeCleanup = 0;
    catalog.list.forEach((category, catIndex) => {
      console.log(`  Categoría ${catIndex + 1}: ${category.spuList.length} servicios`);
      totalBeforeCleanup += category.spuList.length;
    });
    console.log(`Total servicios antes: ${totalBeforeCleanup}`);
    
    // 3. Limpiar catálogo - conservar solo servicios que existen realmente
    let cleanedCount = 0;
    let removedCount = 0;
    
    catalog.list.forEach(category => {
      const cleanSpuList = [];
      
      category.spuList.forEach(spu => {
        // Buscar si el servicio existe por type_id
        const serviceExists = realServices.find(s => s.type_id === spu.id);
        
        if (serviceExists) {
          // Actualizar con ObjectId real y limpiar referencias viejas
          const cleanedSpu = {
            serviceId: serviceExists._id, // 🎯 Nuevo campo principal
            type_id: spu.id, // 📋 Mantener compatibilidad
            type_name: spu.type_name,
            detail_route: spu.detail_route,
            is_netflix: spu.is_netflix || false,
            image: spu.image,
            image_type: spu.image_type || 0,
            thumb_img: spu.thumb_img,
            min_price: spu.min_price,
            currency_icon1: spu.currency_icon1 || '$',
            currency_icon2: spu.currency_icon2 || 'USD($)',
            currency_show_type: spu.currency_show_type || 1,
            vip_status: spu.vip_status || 0,
            lock_status: spu.lock_status || 0,
            rank: spu.rank || 0,
            recent_order: spu.recent_order || [],
            description: spu.description || [],
            prompt: spu.prompt || []
          };
          
          cleanSpuList.push(cleanedSpu);
          cleanedCount++;
          console.log(`  ✅ MANTENIDO: ${spu.type_name} (type_id: ${spu.id} → serviceId: ${serviceExists._id})`);
        } else {
          removedCount++;
          console.log(`  🗑️ ELIMINADO: ${spu.type_name} (type_id: ${spu.id}) - No existe en servicios`);
        }
      });
      
      category.spuList = cleanSpuList;
    });
    
    // 4. Guardar catálogo limpio
    const updateResult = await catalogsCollection.replaceOne(
      { _id: catalog._id },
      catalog
    );
    
    console.log('\n📊 RESULTADO DE LA LIMPIEZA:');
    console.log(`  ✅ Servicios mantenidos: ${cleanedCount}`);
    console.log(`  🗑️ Servicios eliminados: ${removedCount}`);
    console.log(`  📈 Total servicios finales: ${cleanedCount}`);
    console.log(`  💾 Documento actualizado: ${updateResult.modifiedCount === 1 ? 'SÍ' : 'NO'}`);
    
    // 5. Verificación final
    const verificationCatalog = await catalogsCollection.findOne({ language: 'es' });
    const finalCount = verificationCatalog.list.reduce((total, cat) => total + cat.spuList.length, 0);
    
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    console.log(`  📊 Servicios en catálogo: ${finalCount}`);
    console.log(`  📊 Servicios reales en DB: ${realServices.length}`);
    console.log(`  ✅ Coherencia: ${finalCount === realServices.length ? 'PERFECTA' : 'REVISAR'}`);
    
    if (finalCount === realServices.length) {
      console.log('\n🎉 ¡LIMPIEZA EXITOSA! El catálogo ahora está sincronizado con los servicios reales.');
      console.log('🔄 Todos los servicios ahora usan serviceId (ObjectId) como identificador principal.');
    }
    
  } catch (error) {
    console.error('❌ Error durante limpieza:', error);
  } finally {
    await client.close();
    console.log('✅ Desconectado de MongoDB');
  }
}

cleanCatalogDirectly();
