import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { CollectionInfo } from 'mongodb';

interface SchemaInconsistency {
  collection: string;
  similar: string[];
  recommendation: string;
}

interface SchemaRecommendation {
  collection: string;
  suggestedName: string;
}

interface AuditResult {
  collections: {
    name: string;
    type: string;
  }[];
  inconsistencies: SchemaInconsistency[];
  recommendations: SchemaRecommendation[];
}

export async function auditSchemas(connection: Connection): Promise<AuditResult> {
  try {
    console.log('Iniciando auditoría de schemas...');
    console.log('Conexión a la base de datos:', connection.db.databaseName);
    
    // Obtener todas las colecciones
    console.log('Obteniendo lista de colecciones...');
    const collections = await connection.db.listCollections().toArray();
    console.log(`Se encontraron ${collections.length} colecciones.`);
    
    // Preparar resultado de la auditoría
    const auditResult: AuditResult = {
      collections: [],
      inconsistencies: [],
      recommendations: []
    };

    // Mapear colecciones
    auditResult.collections = collections.map((col: CollectionInfo) => ({
      name: col.name,
      type: col.type || 'collection'  // Valor por defecto si type es undefined
    }));

    // Identificar inconsistencias en nomenclatura
    collections.forEach((col: CollectionInfo) => {
      // Verificar si hay versiones con diferentes casos del mismo nombre
      const similarNames = collections.filter((c: CollectionInfo) => 
        c.name.toLowerCase() === col.name.toLowerCase() && c.name !== col.name
      );

      if (similarNames.length > 0) {
        auditResult.inconsistencies.push({
          collection: col.name,
          similar: similarNames.map(s => s.name),
          recommendation: `Estandarizar a snake_case: ${col.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1_$2')}`
        });
      }

      // Verificar si el nombre sigue snake_case
      if (!/^[a-z]+(_[a-z]+)*$/.test(col.name)) {
        auditResult.recommendations.push({
          collection: col.name,
          suggestedName: col.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1_$2')
        });
      }
    });

    // Guardar resultado en un archivo
    const auditFile = path.join(__dirname, '../schema-audit-result.json');
    fs.writeFileSync(
      auditFile,
      JSON.stringify(auditResult, null, 2)
    );

    console.log(`Auditoría completada. Resultados guardados en ${auditFile}`);
    return auditResult;

  } catch (error) {
    console.error('Error durante la auditoría:', error);
    throw error;
  }
}
