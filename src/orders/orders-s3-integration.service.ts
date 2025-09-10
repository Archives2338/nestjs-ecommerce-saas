import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '../files/s3.service';

@Injectable()
export class OrdersS3IntegrationService {
  private readonly logger = new Logger(OrdersS3IntegrationService.name);

  constructor(private readonly s3Service: S3Service) {}

  /**
   * Subir comprobante de pago a S3
   */
  async uploadPaymentReceipt(
    file: Express.Multer.File,
    orderId: string,
    userId: string
  ): Promise<{
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
  }> {
    try {
      // Validar que sea una imagen o PDF
      const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'application/pdf'
      ];

      if (!this.s3Service.validateFileType(file, allowedTypes)) {
        return {
          success: false,
          error: 'Solo se permiten imágenes (JPEG, PNG, WebP) o PDF'
        };
      }

      // Validar tamaño máximo 10MB
      const maxSize = 10 * 1024 * 1024;
      if (!this.s3Service.validateFileSize(file, maxSize)) {
        return {
          success: false,
          error: 'El archivo es demasiado grande (máximo 10MB)'
        };
      }

      // Subir a carpeta específica de comprobantes
      const folder = `payment-receipts/${userId}`;
      const result = await this.s3Service.uploadFile(file, folder);

      if (result.success) {
        this.logger.log(`✅ Comprobante subido para orden ${orderId}: ${result.key}`);
      }

      return result;

    } catch (error) {
      this.logger.error('❌ Error subiendo comprobante:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Subir documentos de verificación de cuenta
   */
  async uploadAccountVerificationDocs(
    files: Express.Multer.File[],
    userId: string
  ): Promise<{
    success: boolean;
    uploadedFiles: Array<{
      originalName: string;
      url?: string;
      key?: string;
      error?: string;
    }>;
  }> {
    try {
      const folder = `account-verification/${userId}`;
      const result = await this.s3Service.uploadMultipleFiles(files, folder);

      this.logger.log(`📄 Documentos de verificación subidos para usuario ${userId}`);

      return {
        success: result.success,
        uploadedFiles: result.results
      };

    } catch (error) {
      this.logger.error('❌ Error subiendo documentos de verificación:', error);
      return {
        success: false,
        uploadedFiles: []
      };
    }
  }

  /**
   * Generar URL firmada para descarga segura de comprobantes
   */
  async getPaymentReceiptDownloadUrl(
    key: string,
    userId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      // Verificar que el usuario tenga acceso al archivo
      if (!key.includes(`payment-receipts/${userId}`)) {
        throw new Error('Acceso denegado al archivo');
      }

      return await this.s3Service.getSignedDownloadUrl(key, expiresIn);
    } catch (error) {
      this.logger.error('❌ Error generando URL de descarga:', error);
      throw error;
    }
  }

  /**
   * Eliminar comprobante (solo para administradores)
   */
  async deletePaymentReceipt(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.s3Service.deleteFile(key);
      
      if (result.success) {
        this.logger.log(`🗑️ Comprobante eliminado: ${key}`);
      }

      return result;
    } catch (error) {
      this.logger.error('❌ Error eliminando comprobante:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
