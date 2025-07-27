import { IsArray, IsString, IsOptional, ArrayNotEmpty } from 'class-validator';

export class GetWebpageContentDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  key: string[];

  @IsString()
  language: string;
}

export class UpdateWebpageContentDto {
  @IsString()
  language: string;

  @IsString()
  section: string;

  @IsOptional()
  content?: Record<string, any>;

  @IsOptional()
  metadata?: {
    createdBy?: string;
    lastModifiedBy?: string;
    tags?: string[];
    category?: string;
    priority?: number;
  };
}

export class BulkUpdateContentDto {
  @IsString()
  language: string;

  @IsOptional()
  content?: Record<string, Record<string, any>>;

  @IsOptional()
  version?: number;

  @IsOptional()
  metadata?: {
    totalSections?: number;
    totalKeys?: number;
    lastSyncAt?: Date;
    sourceVersion?: string;
  };
}
