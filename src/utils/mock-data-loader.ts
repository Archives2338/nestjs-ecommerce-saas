import * as fs from 'fs';
import * as path from 'path';

export class MockDataLoader {
  private static readonly mockPath = path.join(__dirname, '../mock');

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
}
