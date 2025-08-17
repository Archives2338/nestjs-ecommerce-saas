/**
 * DTO para cambio de contraseña de administrador
 */
export class AdminChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
