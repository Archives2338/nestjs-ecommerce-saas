import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteConfig, SiteConfigDocument } from './schemas/site-config.schema';
import { GetSiteConfigDto, UpdateSiteConfigDto } from './dto/site-config.dto';
import { MockDataLoader } from '../utils/mock-data-loader';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    @InjectModel(SiteConfig.name) private siteConfigModel: Model<SiteConfigDocument>,
  ) {}

  async getSiteConfig(getSiteConfigDto: GetSiteConfigDto) {
    try {
      this.logger.log(`Searching for config with language: ${getSiteConfigDto.language}`);
      
      const config = await this.siteConfigModel.findOne({ 
        language: getSiteConfigDto.language 
      }).exec();

      if (!config) {
        this.logger.log('No config found, creating default config');
        // Retornar configuración por defecto si no existe
        return this.createDefaultConfig(getSiteConfigDto.language);
      }

      this.logger.log('Config found successfully');
      return {
        code: 0,
        message: 'Listo',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: config.toObject()
      };
    } catch (error) {
      this.logger.error('Error in getSiteConfig:', error);
      return {
        code: 1,
        message: 'Error al obtener configuración',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  async updateSiteConfig(language: string, updateData: UpdateSiteConfigDto) {
    try {
      const updatedConfig = await this.siteConfigModel.findOneAndUpdate(
        { language },
        updateData,
        { new: true, upsert: true }
      ).exec();

      return {
        code: 0,
        message: 'Configuración actualizada exitosamente',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: updatedConfig
      };
    } catch (error) {
      return {
        code: 1,
        message: 'Error al actualizar configuración',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: null
      };
    }
  }

  private async createDefaultConfig(language: string) {
    try {
      this.logger.log(`Creating default config for language: ${language}`);
      
      // Cargar datos mock desde archivo JSON
      const mockData = MockDataLoader.loadDefaultSiteConfig();
      
      if (!mockData) {
        throw new Error('Could not load default site config data');
      }

      const defaultConfig = new this.siteConfigModel({
        language,
        ...mockData
      });

      this.logger.log('Saving default config to database');
      const savedConfig = await defaultConfig.save();
      this.logger.log('Default config saved successfully');
      
      return {
        code: 0,
        message: 'Configuración por defecto creada',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: savedConfig
      };
    } catch (error) {
      this.logger.error('Error creating default config:', error);
      throw error;
    }
  }
}
