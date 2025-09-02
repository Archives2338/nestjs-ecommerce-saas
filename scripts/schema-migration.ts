import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationStep {
  oldName: string;
  newName: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export async function migrateSchemasNames(connection: Connection) {
  const migrationSteps: MigrationStep[] = [];
  const logFile = path.join(__dirname, '../schema-migration-log.json');

  try {
    // 1. Crear backup de cada colección
    console.log('Iniciando backup de colecciones...');
    const collections = await connection.db.listCollections().toArray();
    
    for (const col of collections) {
      const backupName = `${col.name}_backup_${Date.now()}`;
      console.log(`Creando backup de ${col.name} como ${backupName}`);
      
      try {
        // Crear backup
        await connection.db.collection(col.name).aggregate([
          { $out: backupName }
        ]).toArray();

        // Registrar paso de migración
        const newName = col.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1_$2');
        if (newName !== col.name) {
          migrationSteps.push({
            oldName: col.name,
            newName: newName,
            status: 'pending'
          });
        }
      } catch (error) {
        console.error(`Error al crear backup de ${col.name}:`, error);
        throw error;
      }
    }

    // 2. Realizar la migración
    console.log('Iniciando migración de colecciones...');
    for (const step of migrationSteps) {
      try {
        // Renombrar colección
        await connection.db.collection(step.oldName).rename(step.newName);
        step.status = 'completed';
      } catch (error) {
        step.status = 'failed';
        step.error = error.message;
        console.error(`Error al migrar ${step.oldName}:`, error);
      }
    }

    // 3. Guardar log de migración
    fs.writeFileSync(
      logFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        steps: migrationSteps
      }, null, 2)
    );

    // 4. Reporte final
    const completed = migrationSteps.filter(s => s.status === 'completed').length;
    const failed = migrationSteps.filter(s => s.status === 'failed').length;

    console.log(`
Migración completada:
- Total de colecciones procesadas: ${migrationSteps.length}
- Migraciones exitosas: ${completed}
- Migraciones fallidas: ${failed}
- Log guardado en: ${logFile}
    `);

    return {
      total: migrationSteps.length,
      completed,
      failed,
      steps: migrationSteps
    };

  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}
