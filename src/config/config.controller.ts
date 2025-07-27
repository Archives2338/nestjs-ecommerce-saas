import { Controller, Post, Body, Put, Param, Logger } from '@nestjs/common';
import { ConfigService } from './config.service';
import { GetSiteConfigDto, UpdateSiteConfigDto } from './dto/site-config.dto';

@Controller('index')
export class ConfigController {
  private readonly logger = new Logger(ConfigController.name);
  
  constructor(private readonly configService: ConfigService) {}

  @Post('siteConfig')
  async getSiteConfig(@Body() getSiteConfigDto: GetSiteConfigDto) {
    try {
      this.logger.log(`Getting site config for language: ${getSiteConfigDto.language}`);
      const result = await this.configService.getSiteConfig(getSiteConfigDto);
      this.logger.log('Site config retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error('Error getting site config:', error);
      throw error;
    }
  }

  @Put('siteConfig/:language')
  async updateSiteConfig(
    @Param('language') language: string,
    @Body() updateSiteConfigDto: UpdateSiteConfigDto
  ) {
    return this.configService.updateSiteConfig(language, updateSiteConfigDto);
  }
}
