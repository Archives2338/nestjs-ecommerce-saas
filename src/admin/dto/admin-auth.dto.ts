import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsOptional()
  @IsString()
  rememberMe?: boolean;
}

export class AdminRefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  refresh_token: string;
}

export class AdminChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  confirmPassword: string;
}

export class AdminCreateDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  username: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol es requerido' })
  role: 'super_admin' | 'admin' | 'editor';

  @IsOptional()
  permissions?: string[];
}

export class AdminUpdateDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString()
  role?: 'super_admin' | 'admin' | 'editor';

  @IsOptional()
  permissions?: string[];

  @IsOptional()
  isActive?: boolean;
}
