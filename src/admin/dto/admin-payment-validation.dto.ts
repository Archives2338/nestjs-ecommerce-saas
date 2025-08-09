import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export class ValidatePaymentDto {
  @IsString()
  adminNotes: string;

  @IsOptional()
  @IsString()
  adminId?: string;

  @IsOptional()
  @IsBoolean()
  autoAssignCredentials?: boolean; // Por defecto true
}

export class RejectPaymentDto {
  @IsString()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class GetPendingPaymentsDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['yape', 'plin', 'transferencia'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class PaymentValidationResponseDto {
  orderId: string;
  customerEmail: string;
  serviceName: string;
  planName: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentReference?: string;
  comprobanteUrl?: string;
  comprobanteOcrText?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
  validatedAt?: Date;
  validatedBy?: string;
  assignedCredentials?: {
    email: string;
    password: string;
    profileName?: string;
    accountId: string;
  };
}
