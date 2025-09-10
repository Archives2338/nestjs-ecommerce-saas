import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('api/files')
export class FilesController {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * Subir un archivo único
   * POST /api/files/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    // Validaciones de tipo de archivo (imágenes, documentos comunes)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!this.s3Service.validateFileType(file, allowedTypes)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException('El archivo es demasiado grande (máximo 10MB)');
    }

    const result = await this.s3Service.uploadFile(file, folder || 'general');

    if (!result.success) {
      throw new BadRequestException(`Error subiendo archivo: ${result.error}`);
    }

    return {
      code: 0,
      message: 'Archivo subido exitosamente',
      toast: 0,
      redirect_url: '',
      type: 'success',
      data: {
        url: result.url,
        key: result.key,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
    };
  }

  /**
   * Subir múltiples archivos
   * POST /api/files/upload-multiple
   */
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // máximo 10 archivos
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibieron archivos');
    }

    // Validar cada archivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!this.s3Service.validateFileType(file, allowedTypes)) {
        throw new BadRequestException(`Tipo de archivo no permitido: ${file.originalname}`);
      }
      if (!this.s3Service.validateFileSize(file, maxSize)) {
        throw new BadRequestException(`Archivo demasiado grande: ${file.originalname}`);
      }
    }

    const result = await this.s3Service.uploadMultipleFiles(files, folder || 'general');

    return {
      code: 0,
      message: `${result.results.length} archivos procesados`,
      toast: 0,
      redirect_url: '',
      type: result.success ? 'success' : 'warning',
      data: {
        success: result.success,
        results: result.results,
        totalFiles: files.length,
        successCount: result.results.filter(r => !r.error).length,
      },
    };
  }

  /**
   * Subir imagen de perfil específicamente
   * POST /api/files/upload-avatar
   */
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió imagen de avatar');
    }

    // Solo imágenes para avatares
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!this.s3Service.validateFileType(file, allowedTypes)) {
      throw new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WebP)');
    }

    // Tamaño máximo 5MB para avatares
    const maxSize = 5 * 1024 * 1024;
    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException('La imagen es demasiado grande (máximo 5MB)');
    }

    const result = await this.s3Service.uploadFile(file, 'avatars');

    if (!result.success) {
      throw new BadRequestException(`Error subiendo avatar: ${result.error}`);
    }

    return {
      code: 0,
      message: 'Avatar subido exitosamente',
      toast: 0,
      redirect_url: '',
      type: 'success',
      data: {
        avatarUrl: result.url,
        key: result.key,
      },
    };
  }

  /**
   * Eliminar archivo
   * DELETE /api/files/:key
   */
  @Delete(':key(*)')
  async deleteFile(@Param('key') key: string) {
    const result = await this.s3Service.deleteFile(key);

    if (!result.success) {
      throw new BadRequestException(`Error eliminando archivo: ${result.error}`);
    }

    return {
      code: 0,
      message: 'Archivo eliminado exitosamente',
      toast: 0,
      redirect_url: '',
      type: 'success',
      data: { deletedKey: key },
    };
  }

  /**
   * Obtener URL firmada para descarga segura
   * GET /api/files/signed-url/:key
   */
  @Get('signed-url/:key(*)')
  async getSignedUrl(
    @Param('key') key: string,
    @Query('expires') expires?: string,
  ) {
    try {
      const expiresIn = expires ? parseInt(expires) : 3600; // 1 hora por defecto
      const signedUrl = await this.s3Service.getSignedDownloadUrl(key, expiresIn);

      return {
        code: 0,
        message: 'URL firmada generada',
        toast: 0,
        redirect_url: '',
        type: 'success',
        data: {
          signedUrl,
          expiresIn,
          key,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error generando URL firmada: ${errorMessage}`);
    }
  }
}
