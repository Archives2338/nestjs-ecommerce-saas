const mongoose = require('mongoose');

console.log('🚀 EJECUTANDO MIGRACIÓN: type_id → ObjectId');
mongoose.connect('mongodb://localhost:27017/ecommerce-db')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // 1. Obtener servicios reales
    const Service = mongoose.model('Service', new mongoose.Schema({}, { strict: false }));
    const services = await Service.find({});
    
    // 2. Obtener catálogo
    const Catalog = mongoose.model('Catalog', new mongoose.Schema({}, { strict: false }));
    const catalog = await Catalog.findOne({ language: 'es' });
    
    if (!catalog) {
      console.log('❌ No se encontró catálogo');
      await mongoose.disconnect();
      return;
    }
    
    let updated = 0;
    let deleted = 0;
    const changes = [];
    
    // 3. Migrar cada categoría
    for (const category of catalog.list) {
      const newSpuList = [];
      
      for (const spu of category.spuList) {
        // Buscar servicio correspondiente por type_id
        const matchingService = services.find(s => s.type_id === spu.id);
        
        if (matchingService) {
          // ACTUALIZAR: Convertir a formato ObjectId
          const updatedSpu = {
            ...spu.toObject ? spu.toObject() : spu,
            serviceId: matchingService._id, // 🎯 Nuevo campo principal
            type_id: spu.id, // 📋 Mantener para compatibilidad
            // Remover el campo 'id' viejo
          };
          delete updatedSpu.id; // Eliminar el campo id (type_id)
          delete updatedSpu.serviceRef; // Eliminar serviceRef viejo
          
          newSpuList.push(updatedSpu);
          updated++;
          
          changes.push({
            action: 'UPDATED',
            service: spu.type_name,
            oldId: spu.id,
            newServiceId: matchingService._id.toString(),
            oldServiceRef: spu.serviceRef
          });
          
          console.log(`✅ UPDATED: ${spu.type_name}`);
          console.log(`   Old type_id: ${spu.id} → New serviceId: ${matchingService._id}`);
          
        } else {
          // ELIMINAR: Servicio no existe
          deleted++;
          changes.push({
            action: 'DELETED',
            service: spu.type_name,
            oldId: spu.id,
            oldServiceRef: spu.serviceRef,
            reason: 'Service not found in database'
          });
          
          console.log(`🗑️ DELETED: ${spu.type_name} (type_id: ${spu.id})`);
        }
      }
      
      // Actualizar la lista de servicios de la categoría
      category.spuList = newSpuList;
    }
    
    // 4. Guardar cambios
    if (updated > 0 || deleted > 0) {
      await catalog.save();
      console.log('\n💾 Cambios guardados en la base de datos');
    }
    
    // 5. Resumen final
    console.log('\n📊 MIGRACIÓN COMPLETADA:');
    console.log(`   ✅ Servicios actualizados: ${updated}`);
    console.log(`   🗑️ Servicios eliminados: ${deleted}`);
    console.log(`   📈 Servicios finales en catálogo: ${updated}`);
    
    console.log('\n📋 DETALLE DE CAMBIOS:');
    changes.forEach((change, index) => {
      console.log(`  ${index + 1}. ${change.action}: ${change.service}`);
      if (change.action === 'UPDATED') {
        console.log(`     ⚡ type_id ${change.oldId} → serviceId ${change.newServiceId}`);
        console.log(`     🔄 serviceRef ${change.oldServiceRef} → removed`);
      } else {
        console.log(`     ❌ Removed (${change.reason})`);
      }
    });
    
    // 6. Verificar resultado
    const updatedCatalog = await Catalog.findOne({ language: 'es' });
    const finalCount = updatedCatalog.list.reduce((total, cat) => total + cat.spuList.length, 0);
    
    console.log(`\n🎯 VERIFICACIÓN:`);
    console.log(`   📊 Servicios en catálogo después de migración: ${finalCount}`);
    console.log(`   📊 Servicios reales en base de datos: ${services.length}`);
    console.log(`   ✅ Coherencia: ${finalCount === services.length ? 'PERFECTO' : 'REVISAR'}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Migración completada exitosamente!');
    console.log('🔄 Ahora puedes usar los nuevos métodos *WithObjectId');
    
  })
  .catch(err => {
    console.error('❌ Error durante migración:', err);
    process.exit(1);
  });
