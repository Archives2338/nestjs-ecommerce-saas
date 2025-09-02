import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { auditSchemas } from './schema-audit';

async function bootstrap() {
  let app;
  try {
    console.log('Iniciando aplicación...');
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn']  // Reducir el ruido en los logs
    });
    
    console.log('Obteniendo conexión a la base de datos...');
    const connection = await app.get(getConnectionToken()) as Connection;
    
    if (!connection || !connection.db) {
      throw new Error('No se pudo establecer la conexión con la base de datos');
    }

    console.log(`Conectado a la base de datos: ${connection.db.databaseName}`);
    console.log('Ejecutando auditoría...');
    const result = await auditSchemas(connection);

    console.log('\nResumen de la auditoría:');
    console.log(`- Total de colecciones: ${result.collections.length}`);
    console.log(`- Inconsistencias encontradas: ${result.inconsistencies.length}`);
    console.log(`- Recomendaciones de cambios: ${result.recommendations.length}`);
    
    console.log('\nResumen de la auditoría:');
    console.log(`- Total de colecciones: ${result.collections.length}`);
    console.log(`- Inconsistencias encontradas: ${result.inconsistencies.length}`);
    console.log(`- Recomendaciones de cambios: ${result.recommendations.length}`);
    
    await app.close();
  } catch (error) {
    console.error('Error durante la ejecución:', error);
    process.exit(1);
  }
}

bootstrap();
