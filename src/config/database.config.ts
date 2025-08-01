import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (configService: ConfigService): MongooseModuleOptions => {
  const mongoUri = configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/ecommerce-db';
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  
  const baseConfig: MongooseModuleOptions = {
    uri: mongoUri,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Configuraciones específicas por entorno
  if (nodeEnv === 'production') {
    return {
      ...baseConfig,
      // Configuraciones para producción
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true,
      w: 'majority', // Write concern
    };
  } 
  
  if (nodeEnv === 'development') {
    return {
      ...baseConfig,
      // Configuraciones para desarrollo
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
  }

  return baseConfig;
};