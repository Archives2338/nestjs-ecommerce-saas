import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { auditSchemas } from './schema-audit';
import { migrateSchemasNames } from './schema-migration';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function runMigration() {
  try {
    // 1. Inicializar la aplicación
    const app = await NestFactory.create(AppModule);
    const connection = app.get(Connection);

    console.log('Conectado a la base de datos.');

    // 2. Ejecutar auditoría
    console.log('\nEjecutando auditoría de schemas...');
    const auditResult = await auditSchemas(connection);

    console.log('\nResultados de la auditoría:');
    console.log(`- Colecciones encontradas: ${auditResult.collections.length}`);
    console.log(`- Inconsistencias detectadas: ${auditResult.inconsistencies.length}`);
    console.log(`- Recomendaciones de cambios: ${auditResult.recommendations.length}`);

    // 3. Confirmación del usuario
    const confirm = await question('\n¿Deseas proceder con la migración? (si/no): ');
    
    if (confirm.toLowerCase() !== 'si') {
      console.log('Migración cancelada por el usuario.');
      await app.close();
      process.exit(0);
    }

    // 4. Ejecutar migración
    console.log('\nIniciando proceso de migración...');
    const migrationResult = await migrateSchemasNames(connection);

    // 5. Mostrar resultados
    console.log('\nResultados de la migración:');
    console.log(`- Total de colecciones procesadas: ${migrationResult.total}`);
    console.log(`- Migraciones exitosas: ${migrationResult.completed}`);
    console.log(`- Migraciones fallidas: ${migrationResult.failed}`);

    // 6. Cerrar la aplicación
    await app.close();
    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('Error durante el proceso:', error);
    process.exit(1);
  }
}

runMigration();
