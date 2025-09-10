const { MongoClient } = require('mongodb');

async function validateObjectIdMigration() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB para validación');
    
    const db = client.db('ecommerce-db');
    
    // 1. Obtener servicios reales
    const servicesCollection = db.collection('services');
    const realServices = await servicesCollection.find({}).toArray();
    
    console.log('📊 SERVICIOS REALES EN BASE DE DATOS:');
    console.log(`Total: ${realServices.length}`);
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
    
    console.log('\n📋 VALIDACIÓN DE MIGRACIÓN OBJECTID:');
    console.log('='.repeat(60));
    
    let totalServices = 0;
    let servicesWithObjectId = 0;
    let servicesWithTypeIdOnly = 0;
    let validObjectIdReferences = 0;
    let issues = [];
    
    for (const category of catalog.list) {
      console.log(`\n🏷️ Categoría: ${category.id}`);
      
      for (const spu of category.spuList) {
        totalServices++;
        const hasServiceId = !!spu.serviceId;
        const hasTypeId = !!(spu.type_id || spu.id);
        
        console.log(`  📦 Servicio: ${spu.type_name}`);
        console.log(`     🆔 serviceId: ${spu.serviceId || 'N/A'}`);
        console.log(`     📋 type_id: ${spu.type_id || spu.id || 'N/A'}`);
        
        if (hasServiceId) {
          servicesWithObjectId++;
          
          // Verificar si el ObjectId corresponde a un servicio real
          const realService = realServices.find(s => 
            s._id.toString() === spu.serviceId.toString()
          );
          
          if (realService) {
            validObjectIdReferences++;
            console.log(`     ✅ Status: VALID_OBJECTID (${realService.type_name || 'Sin nombre'})`);
          } else {
            console.log(`     ❌ Status: INVALID_OBJECTID - No existe servicio con este ObjectId`);
            issues.push({
              type: 'invalid_objectid',
              serviceName: spu.type_name,
              serviceId: spu.serviceId.toString(),
              categoryId: category.id
            });
          }
        } else if (hasTypeId) {
          servicesWithTypeIdOnly++;
          console.log(`     ⚠️ Status: LEGACY_TYPEID - Aún usa type_id`);
          issues.push({
            type: 'missing_objectid',
            serviceName: spu.type_name,
            type_id: spu.type_id || spu.id,
            categoryId: category.id
          });
        } else {
          console.log(`     🚫 Status: NO_IDENTIFIER - Sin identificador`);
          issues.push({
            type: 'no_identifier',
            serviceName: spu.type_name,
            categoryId: category.id
          });
        }
      }
    }
    
    const migrationPercentage = totalServices > 0 ? 
      (servicesWithObjectId / totalServices * 100) : 100;
    
    const validityPercentage = servicesWithObjectId > 0 ? 
      (validObjectIdReferences / servicesWithObjectId * 100) : 100;
    
    console.log('\n📊 RESUMEN DE VALIDACIÓN:');
    console.log('='.repeat(60));
    console.log(`📈 Total servicios en catálogo: ${totalServices}`);
    console.log(`✅ Servicios con ObjectId: ${servicesWithObjectId}`);
    console.log(`📋 Servicios solo con type_id: ${servicesWithTypeIdOnly}`);
    console.log(`🎯 Referencias ObjectId válidas: ${validObjectIdReferences}`);
    console.log(`📊 Porcentaje de migración: ${migrationPercentage.toFixed(1)}%`);
    console.log(`✅ Porcentaje de validez: ${validityPercentage.toFixed(1)}%`);
    
    console.log('\n🎯 ESTADO FINAL:');
    if (servicesWithTypeIdOnly === 0 && issues.length === 0) {
      console.log('🎉 SISTEMA COMPLETAMENTE MIGRADO A OBJECTID');
      console.log('✅ Todos los servicios usan ObjectId como identificador principal');
      console.log('✅ Todas las referencias ObjectId son válidas');
    } else {
      console.log('⚠️ MIGRACIÓN PENDIENTE O PROBLEMAS ENCONTRADOS:');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.type.toUpperCase()}: ${issue.serviceName}`);
        if (issue.serviceId) {
          console.log(`     ObjectId inválido: ${issue.serviceId}`);
        }
        if (issue.type_id) {
          console.log(`     type_id sin migrar: ${issue.type_id}`);
        }
      });
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    if (servicesWithTypeIdOnly > 0) {
      console.log('   • Ejecutar limpieza con ObjectId para completar migración');
      console.log('   • Actualizar frontend para usar serviceId en lugar de type_id');
    }
    if (issues.some(i => i.type === 'invalid_objectid')) {
      console.log('   • Limpiar referencias ObjectId inválidas');
      console.log('   • Verificar servicios eliminados de la base de datos');
    }
    if (migrationPercentage === 100 && validityPercentage === 100) {
      console.log('   • ✅ Sistema ready para uso exclusivo de ObjectId');
      console.log('   • Considerar deprecar campos type_id legacy');
    }
    
  } catch (error) {
    console.error('❌ Error durante validación:', error);
  } finally {
    await client.close();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

validateObjectIdMigration();
