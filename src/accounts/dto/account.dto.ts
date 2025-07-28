import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum AccountStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned', 
  MAINTENANCE = 'maintenance',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired'
}

export enum AccountType {
  SHARED = 'shared',
  INDIVIDUAL = 'individual',
  FAMILY = 'family',
  PREMIUM = 'premium'
}

// DTOs
export class AccountCredentialsDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  backup_email?: string;

  @IsOptional()
  @IsArray()
  recovery_codes?: string[];

  @IsOptional()
  @IsString()
  profile_name?: string;
}

export class SlotInfoDto {
  @IsNumber()
  max_slots: number;

  @IsNumber()
  used_slots: number;

  @IsArray()
  assigned_to: string[];
}

export class CreateAccountDto {
  @IsNumber()
  service_id: number;

  @IsString()
  service_name: string;

  @IsEnum(AccountType)
  account_type: AccountType;

  @ValidateNested()
  @Type(() => AccountCredentialsDto)
  credentials: AccountCredentialsDto;

  @ValidateNested()
  @Type(() => SlotInfoDto)
  slot_info: SlotInfoDto;

  @IsString()
  plan_type: string;

  @IsString()
  subscription_expires_at: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: {
    country?: string;
    region?: string;
    ip_restrictions?: string[];
    device_limit?: number;
    quality?: string;
    features?: string[];
  };
}

export class UpdateAccountDto {
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => AccountCredentialsDto)
  credentials?: AccountCredentialsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlotInfoDto)
  slot_info?: SlotInfoDto;

  @IsOptional()
  @IsString()
  plan_type?: string;

  @IsOptional()
  @IsString()
  subscription_expires_at?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: {
    country?: string;
    region?: string;
    ip_restrictions?: string[];
    device_limit?: number;
    quality?: string;
    features?: string[];
  };
}

export class GetAccountsDto {
  @IsOptional()
  @IsNumber()
  service_id?: number;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @IsEnum(AccountType)
  account_type?: AccountType;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class AssignAccountDto {
  @IsString()
  order_id: string;

  @IsOptional()
  @IsString()
  profile_name?: string;
}
