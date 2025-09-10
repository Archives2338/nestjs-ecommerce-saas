import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName = 'mybucketimperio';

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are required: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION || 'us-east-2',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(`🔌 S3Service initialized for bucket: ${this.bucketName}`);
  }

  /**
   * Subir archivo a S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads'
  ): Promise<{
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
  }> {
    try {
      // Generar nombre único para el archivo
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      // Configurar el comando de subida
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: 'inline',
        // Removido ACL ya que el bucket no los permite
      });

      // Ejecutar la subida
      await this.s3Client.send(command);

      // Construir URL pública (puede no funcionar si el bucket es privado)
      const publicUrl = `https://${this.bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

      this.logger.log(`✅ Archivo subido exitosamente: ${key}`);

      return {
        success: true,
        url: publicUrl,
        key: key,
      };

    } catch (error) {
      this.logger.error('❌ Error subiendo archivo a S3:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Subir archivo a S3 y retornar URL firmada (para buckets privados)
   */
  async uploadFileWithSignedUrl(
    file: Express.Multer.File,
    folder: string = 'uploads',
    urlExpiresIn: number = 86400 // 24 horas por defecto
  ): Promise<{
    success: boolean;
    url?: string;
    signedUrl?: string;
    key?: string;
    error?: string;
  }> {
    try {
      // Primero subir el archivo
      const uploadResult = await this.uploadFile(file, folder);
      
      if (!uploadResult.success) {
        return uploadResult;
      }

      // Generar URL firmada
      const signedUrl = await this.getSignedDownloadUrl(uploadResult.key!, urlExpiresIn);

      this.logger.log(`✅ Archivo subido con URL firmada: ${uploadResult.key}`);

      return {
        success: true,
        url: uploadResult.url, // URL pública (puede no funcionar)
        signedUrl: signedUrl,   // URL firmada (siempre funciona)
        key: uploadResult.key,
      };

    } catch (error) {
      this.logger.error('❌ Error subiendo archivo con URL firmada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Generar URL firmada para descarga segura
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn, // segundos
      });

      return signedUrl;
    } catch (error) {
      this.logger.error('❌ Error generando URL firmada:', error);
      throw error;
    }
  }

  /**
   * Eliminar archivo de S3
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`🗑️ Archivo eliminado: ${key}`);

      return { success: true };
    } catch (error) {
      this.logger.error('❌ Error eliminando archivo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Subir múltiples archivos
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads'
  ): Promise<{
    success: boolean;
    results: Array<{
      originalName: string;
      url?: string;
      key?: string;
      error?: string;
    }>;
  }> {
    const results = [];

    for (const file of files) {
      const uploadResult = await this.uploadFile(file, folder);
      results.push({
        originalName: file.originalname,
        ...uploadResult,
      });
    }

    const successCount = results.filter(r => !r.error).length;

    return {
      success: successCount === files.length,
      results,
    };
  }

  /**
   * Validar tipo de archivo
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Validar tamaño de archivo (en bytes)
   */
  validateFileSize(file: Express.Multer.File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }
}
