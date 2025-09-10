import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    // Configurar variables de entorno para el test
    process.env.AWS_ACCESS_KEY_ID = 'test_access_key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test_secret_key';
    process.env.AWS_S3_REGION = 'us-east-2';

    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate file types correctly', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    const allowedTypes = ['image/jpeg', 'image/png'];
    const result = service.validateFileType(mockFile, allowedTypes);
    
    expect(result).toBe(true);
  });

  it('should validate file size correctly', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    const maxSize = 2048; // 2KB
    const result = service.validateFileSize(mockFile, maxSize);
    
    expect(result).toBe(true);
  });

  it('should reject invalid file types', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.exe',
      mimetype: 'application/exe',
      size: 1024,
    } as Express.Multer.File;

    const allowedTypes = ['image/jpeg', 'image/png'];
    const result = service.validateFileType(mockFile, allowedTypes);
    
    expect(result).toBe(false);
  });

  it('should reject files that are too large', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 3072, // 3KB
    } as Express.Multer.File;

    const maxSize = 2048; // 2KB
    const result = service.validateFileSize(mockFile, maxSize);
    
    expect(result).toBe(false);
  });
});
