import { IsEmail, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class SignProcessDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  redirect_uri: string;

  @IsString()
  language: string;

  @IsOptional()
  @IsString()
  'g-recaptcha-response'?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  agree?: number;
}

export class CodeSignDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  code: string;

  @IsString()
  redirect_uri: string;

  @IsString()
  language: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  agreeTC?: number;

  @IsOptional()
  @IsString()
  'g-recaptcha-response'?: string;
}
