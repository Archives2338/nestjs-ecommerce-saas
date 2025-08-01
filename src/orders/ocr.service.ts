import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Procesa una imagen y extrae el texto usando Tesseract.js
   * @param imageBuffer Buffer de la imagen (comprobante)
   * @returns Texto extraído
   */
  async extractText(imageBuffer: Buffer): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'spa', {
        logger: m => this.logger.debug(m)
      });
      return text;
    } catch (error) {
      this.logger.error('Error en OCR:', error);
      throw new Error('No se pudo procesar el comprobante');
    }
  }
}
