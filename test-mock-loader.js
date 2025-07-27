import { MockDataLoader } from '../utils/mock-data-loader';

// Test script para verificar que MockDataLoader funciona
console.log('Testing MockDataLoader...');

try {
  const mockDataLoader = new MockDataLoader();
  const esContent = mockDataLoader.loadContentData('es');
  console.log('ES Content loaded:', esContent ? 'SUCCESS' : 'FAILED');
  if (esContent) {
    console.log('ES Content sections:', Object.keys(esContent.content || {}));
    console.log('ES Home keys:', Object.keys(esContent.content?.home || {}));
  }
  
  const enContent = mockDataLoader.loadContentData('en');
  console.log('EN Content loaded:', enContent ? 'SUCCESS' : 'FAILED');
} catch (error) {
  console.error('Error testing MockDataLoader:', error);
}
