import { IsString, IsEmail, IsOptional, IsBoolean, IsObject, IsArray, IsDateString } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  tenantId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    theme: string;
    currency: string;
    language: string;
    paymentMethods: string[];
    shippingMethods: string[];
  };

  @IsOptional()
  @IsObject()
  branding?: {
    logo: string;
    colors: {
      primary: string;
      secondary: string;
    };
    fonts: string;
  };

  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @IsOptional()
  @IsDateString()
  subscriptionExpiry?: Date;

  @IsOptional()
  @IsObject()
  limits?: {
    maxProducts: number;
    maxOrders: number;
    maxUsers: number;
  };
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    theme?: string;
    currency?: string;
    language?: string;
    paymentMethods?: string[];
    shippingMethods?: string[];
  };

  @IsOptional()
  @IsObject()
  branding?: {
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
    fonts?: string;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @IsOptional()
  @IsDateString()
  subscriptionExpiry?: Date;

  @IsOptional()
  @IsObject()
  limits?: {
    maxProducts?: number;
    maxOrders?: number;
    maxUsers?: number;
  };
}
