import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebpageContentDocument = WebpageContent & Document & {
  _id: Types.ObjectId;
};

// Esquema para cache de contenido optimizado
@Schema({ 
  timestamps: true,
  collection: 'webpage_content'
})
export class WebpageContent {
  @Prop({ required: true, index: true })
  language: string;

  @Prop({ required: true, type: Object })
  content: Record<string, Record<string, any>>;

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ 
    required: false, 
    type: {
      totalSections: { type: Number },
      totalKeys: { type: Number },
      lastSyncAt: { type: Date },
      sourceVersion: { type: String }
    }
  })
  metadata?: {
    totalSections?: number;
    totalKeys?: number;
    lastSyncAt?: Date;
    sourceVersion?: string;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WebpageContentSchema = SchemaFactory.createForClass(WebpageContent);

// Índices para optimización
WebpageContentSchema.index({ language: 1, isActive: 1 }, { unique: true });
WebpageContentSchema.index({ language: 1, version: -1 });
WebpageContentSchema.index({ updatedAt: -1 });
