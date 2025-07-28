import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  IsBoolean, 
  IsEnum,
  IsNotEmpty,
  Matches,
  IsPhoneNumber,
  Length
} from 'class-validator';

// DTO para el paso 1: Solo email
export class CheckEmailDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;
}

// DTO para el paso 2: Verificar código
export class VerifyCodeDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString({ message: 'Código debe ser una cadena' })
  @Length(6, 6, { message: 'Código debe tener 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'Código debe contener solo números' })
  code: string;
}

// DTO para el paso 3: Establecer contraseña y completar registro
export class CompleteRegistrationDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString({ message: 'Contraseña debe ser una cadena' })
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'
  })
  password: string;

  @IsString({ message: 'Nombre es requerido' })
  @IsNotEmpty({ message: 'Nombre no puede estar vacío' })
  @MaxLength(50, { message: 'Nombre no puede exceder 50 caracteres' })
  firstName: string;

  @IsString({ message: 'Apellido es requerido' })
  @IsNotEmpty({ message: 'Apellido no puede estar vacío' })
  @MaxLength(50, { message: 'Apellido no puede exceder 50 caracteres' })
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class RegisterCustomerDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString({ message: 'Contraseña es requerida' })
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'Contraseña no puede exceder 50 caracteres' })
  password: string;

  @IsString({ message: 'Nombre es requerido' })
  @MaxLength(50, { message: 'Nombre no puede exceder 50 caracteres' })
  firstName: string;

  @IsString({ message: 'Apellido es requerido' })
  @MaxLength(50, { message: 'Apellido no puede exceder 50 caracteres' })
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['es', 'en'], { message: 'Idioma debe ser es o en' })
  preferredLanguage?: string;
}

export class LoginCustomerDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString({ message: 'Contraseña es requerida' })
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token es requerido' })
  token: string;

  @IsString({ message: 'Nueva contraseña es requerida' })
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'Contraseña no puede exceder 50 caracteres' })
  newPassword: string;
}

export class VerifyEmailDto {
  @IsString({ message: 'Token de verificación es requerido' })
  token: string;
}

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['es', 'en'])
  preferredLanguage?: string;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'MXN'])
  preferredCurrency?: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Contraseña actual es requerida' })
  currentPassword: string;

  @IsString({ message: 'Nueva contraseña es requerida' })
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'Contraseña no puede exceder 50 caracteres' })
  newPassword: string;
}

// DTOs para OAuth (preparados para futuro)
export class GoogleOAuthDto {
  @IsString({ message: 'Google token es requerido' })
  googleToken: string;

  @IsOptional()
  @IsEnum(['es', 'en'])
  preferredLanguage?: string;
}

export class FacebookOAuthDto {
  @IsString({ message: 'Facebook token es requerido' })
  facebookToken: string;

  @IsOptional()
  @IsEnum(['es', 'en'])
  preferredLanguage?: string;
}

// Respuestas de API
export class CustomerAuthResponse {
  code: number;
  message: string;
  toast: number;
  redirect_url: string;
  type: 'success' | 'error' | 'info' | 'warning';
  data: {
    token?: string;
    refreshToken?: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      emailVerified: boolean;
      preferredLanguage: string;
    };
    // Campos adicionales para el nuevo flujo
    emailExists?: boolean;
    email?: string;
    codeLength?: number;
    expiresIn?: number;
    verified?: boolean;
  } | null;
}
