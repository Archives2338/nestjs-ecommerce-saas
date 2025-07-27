import * as fs from 'fs';
import * as path from 'path';

export class MockDataLoader {
  private static readonly mockPath = path.join(process.cwd(), 'src', 'mock');

  static loadDefaultSiteConfig(): any {
    try {
      const filePath = path.join(this.mockPath, 'default-site-config.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error loading default site config mock data:', error);
      return null;
    }
  }

  static loadDefaultCatalog(): any {
    try {
      const filePath = path.join(this.mockPath, 'default-catalog.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error loading default catalog mock data:', error);
      return null;
    }
  }

  static loadContentData(language: string): any {
    try {
      const filePath = path.join(this.mockPath, `default-content-${language}.json`);
      console.log(`Attempting to load content from: ${filePath}`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(fileContent);
      console.log(`Successfully loaded content for ${language} with ${Object.keys(parsed.content || {}).length} sections`);
      return parsed;
    } catch (error) {
      console.error(`Error loading content mock data for language ${language}:`, error);
      return null;
    }
  }

  // Métodos de instancia para compatibilidad
  loadContentData(language: string): any {
    return MockDataLoader.loadContentData(language);
  }
}
