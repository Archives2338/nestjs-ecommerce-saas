import { IsString, IsNumber, IsOptional, IsEnum, IsDate, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AccountType, AccountStatus } from '../schemas/account.schema';

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

  @IsOptional()
  @IsNumber()
  used_slots?: number;

  @IsOptional()
  @IsArray()
  assigned_to?: string[];
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

  @Transform(({ value }) => new Date(value))
  @IsDate()
  subscription_expires_at: Date;

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
  @Transform(({ value }) => new Date(value))
  @IsDate()
  subscription_expires_at?: Date;

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
  @IsString()
  service_name?: string;

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
  user_id: string;

  @IsString()
  order_id: string;

  @IsOptional()
  @IsString()
  profile_name?: string;

  @IsOptional()
  @IsString()
  profile_pin?: string;
}
