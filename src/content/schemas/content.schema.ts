import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContentDocument = Content & Document;

// Sub-esquema para parámetros
@Schema({ _id: false })
export class ContentParams {
  @Prop({ type: Map, of: String, default: {} })
  params: Map<string, string>;
}

// Sub-esquema para cada texto individual
@Schema({ _id: false })
export class ContentText {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop({ type: Map, of: String, default: {} })
  params: Map<string, string>;

  @Prop({ default: Date.now })
  lastModified: Date;

  @Prop({ required: false })
  description?: string;

  @Prop({ default: false })
  isActive: boolean;
}

// Esquema principal para secciones de contenido
@Schema({ 
  timestamps: true,
  collection: 'webpage_content'
})
export class Content {
  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  section: string; // 'home', 'purchase', 'payment', etc.

  @Prop({ type: [ContentText], default: [] })
  texts: ContentText[];

  @Prop({ type: Map, of: String, default: {} })
  globalParams: Map<string, string>;

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  metadata?: {
    createdBy?: string;
    lastModifiedBy?: string;
    tags?: string[];
    category?: string;
    priority?: number;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ContentSchema = SchemaFactory.createForClass(Content);

// Índices para optimización
ContentSchema.index({ language: 1, section: 1 });
ContentSchema.index({ language: 1, 'texts.key': 1 });
ContentSchema.index({ section: 1, isActive: 1 });
ContentSchema.index({ language: 1, isActive: 1 });
