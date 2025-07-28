import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document & {
  _id: Types.ObjectId;
};

// Estados de las cuentas
export enum AccountStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned', 
  MAINTENANCE = 'maintenance',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired'
}

// Tipos de cuenta
export enum AccountType {
  SHARED = 'shared',        // Cuenta compartida
  INDIVIDUAL = 'individual', // Cuenta individual
  FAMILY = 'family',        // Cuenta familiar
  PREMIUM = 'premium'       // Cuenta premium
}

// Esquema para credenciales (separado por seguridad)
@Schema({ _id: false })
export class AccountCredentials {
  @Prop({ required: true, select: false }) // No se selecciona por defecto
  email: string;

  @Prop({ required: true, select: false }) // No se selecciona por defecto  
  password: string;

  @Prop({ required: false, select: false })
  backup_email?: string;

  @Prop({ required: false, select: false })
  recovery_codes?: string[];

  @Prop({ required: false })
  profile_name?: string;
}

// Esquema para información de slots/usuarios
@Schema({ _id: false })
export class SlotInfo {
  @Prop({ required: true, default: 1 })
  max_slots: number;

  @Prop({ required: true, default: 0 })
  used_slots: number;

  @Prop({ type: [String], default: [] })
  assigned_to: string[]; // IDs de órdenes o usuarios asignados
}

// Esquema principal de cuentas
@Schema({ 
  timestamps: true,
  collection: 'accounts'
})
export class Account {
  @Prop({ required: true, index: true })
  service_id: number; // Referencia al servicio (Spotify=4, Netflix=1, etc.)

  @Prop({ required: true })
  service_name: string; // "Spotify", "Netflix", etc.

  @Prop({ required: true, enum: AccountType })
  account_type: AccountType;

  @Prop({ required: true, enum: AccountStatus, index: true })
  status: AccountStatus;

  @Prop({ type: AccountCredentials, required: true })
  credentials: AccountCredentials;

  @Prop({ type: SlotInfo, required: true })
  slot_info: SlotInfo;

  @Prop({ required: true })
  plan_type: string; // "6 meses Personal", "12 meses Familia", etc.

  @Prop({ required: true })
  subscription_expires_at: Date;

  @Prop({ required: false })
  last_login_check?: Date;

  @Prop({ required: false })
  notes?: string; // Notas administrativas

  @Prop({ 
    required: false,
    type: {
      country: { type: String },
      region: { type: String },
      ip_restrictions: [{ type: String }],
      device_limit: { type: Number },
      quality: { type: String }, // HD, 4K, etc.
      features: [{ type: String }]
    }
  })
  metadata?: {
    country?: string;
    region?: string;
    ip_restrictions?: string[];
    device_limit?: number;
    quality?: string;
    features?: string[];
  };

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ required: false })
  created_by?: string; // ID del admin que creó la cuenta
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Índices para optimización
AccountSchema.index({ service_id: 1, status: 1 });
AccountSchema.index({ service_name: 1, account_type: 1 });
AccountSchema.index({ status: 1, subscription_expires_at: 1 });
AccountSchema.index({ 'slot_info.max_slots': 1, 'slot_info.used_slots': 1 });
AccountSchema.index({ created_by: 1 });
AccountSchema.index({ updated_at: -1 });
