// 📧 ESTRATEGIA DE EMAIL PARA REGISTRO
// =====================================

/**
 * 1. TIPOS DE EMAILS A IMPLEMENTAR
 */

interface EmailTypes {
  VERIFICATION: 'verificacion-cuenta',
  WELCOME: 'bienvenida',
  PASSWORD_RESET: 'reset-password',
  ACCOUNT_SUSPENDED: 'cuenta-suspendida',
  ORDER_CONFIRMATION: 'confirmacion-orden'
}

/**
 * 2. FLUJO DE REGISTRO CON EMAIL
 */

class RegistrationEmailFlow {
  
  // Paso 1: Usuario se registra
  async registerUser(userData: RegisterDto) {
    // 1. Crear usuario con status 'pending_verification'
    // 2. Generar token de verificación (6 dígitos + expiración)
    // 3. Enviar email de verificación
    // 4. Retornar respuesta de "revisa tu email"
  }

  // Paso 2: Enviar email de verificación
  async sendVerificationEmail(user: User, token: string) {
    const emailTemplate = {
      to: user.email,
      subject: '🔐 Verifica tu cuenta en GamsGo',
      template: 'verification',
      variables: {
        userName: user.name,
        verificationCode: token,
        expiresIn: '15 minutos',
        verificationUrl: `${process.env.FRONTEND_URL}/verify?token=${token}`
      }
    };
  }

  // Paso 3: Usuario confirma email
  async verifyEmail(token: string) {
    // 1. Validar token (existencia + expiración)
    // 2. Activar cuenta (status = 'active')
    // 3. Enviar email de bienvenida
    // 4. Limpiar token usado
  }
}

/**
 * 3. SISTEMA DE TEMPLATES DE EMAIL
 */

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

const EMAIL_TEMPLATES = {
  verification: {
    subject: '🔐 Verifica tu cuenta en {{siteName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">¡Hola {{userName}}!</h1>
        <p>Gracias por registrarte en {{siteName}}. Para completar tu registro, verifica tu email.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h2 style="color: #007bff; font-size: 32px; letter-spacing: 4px;">{{verificationCode}}</h2>
          <p style="color: #666;">Este código expira en {{expiresIn}}</p>
        </div>
        
        <p>O haz clic en el siguiente enlace:</p>
        <a href="{{verificationUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verificar mi cuenta
        </a>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Si no te registraste en {{siteName}}, puedes ignorar este email.
        </p>
      </div>
    `
  },
  
  welcome: {
    subject: '🎉 ¡Bienvenido a {{siteName}}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">¡Cuenta activada exitosamente!</h1>
        <p>¡Hola {{userName}}!</p>
        <p>Tu cuenta ha sido verificada y ya puedes disfrutar de todos nuestros servicios premium compartidos.</p>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>🎁 ¿Qué puedes hacer ahora?</h3>
          <ul>
            <li>Explorar nuestros servicios premium</li>
            <li>Comprar suscripciones compartidas</li>
            <li>Acceder a tu panel de usuario</li>
            <li>Revisar el historial de órdenes</li>
          </ul>
        </div>
        
        <a href="{{dashboardUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ir a mi cuenta
        </a>
      </div>
    `
  }
};

/**
 * 4. CONFIGURACIÓN DE PROVEEDORES DE EMAIL
 */

interface EmailProvider {
  name: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
  config: any;
}

// Opción 1: SendGrid (Recomendado para producción)
const SENDGRID_CONFIG = {
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: 'noreply@gamsgo.com',
  fromName: 'GamsGo Team'
};

// Opción 2: SMTP (Para desarrollo o servidores propios)
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

/**
 * 5. SISTEMA DE COLAS PARA EMAILS
 */

interface EmailQueue {
  id: string;
  to: string;
  template: string;
  variables: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
  scheduledAt?: Date;
  attempts: number;
  status: 'pending' | 'sent' | 'failed';
}

/**
 * 6. MEJORES PRÁCTICAS DE SEGURIDAD
 */

const SECURITY_BEST_PRACTICES = {
  // Tokens de verificación
  tokenLength: 6, // Solo números para facilidad de uso
  tokenExpiration: 15 * 60 * 1000, // 15 minutos
  maxAttempts: 3, // Máximo 3 intentos de verificación
  
  // Rate limiting
  emailsPerHour: 5, // Máximo 5 emails por hora por usuario
  
  // Validaciones
  emailDomainBlacklist: ['tempmail.com', '10minutemail.com'],
  
  // Logs de seguridad
  logAllEmailAttempts: true,
  alertOnSuspiciousActivity: true
};

/**
 * 7. MÉTRICAS Y ANALYTICS
 */

interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  verificationRate: number; // % de usuarios que verifican
}

/**
 * 8. IMPLEMENTACIÓN PASO A PASO
 */

const IMPLEMENTATION_STEPS = {
  step1: "Configurar proveedor de email (SendGrid/SMTP)",
  step2: "Crear sistema de templates dinámicos",
  step3: "Implementar generación de tokens seguros",
  step4: "Crear endpoints de verificación",
  step5: "Implementar cola de emails con Bull/Redis",
  step6: "Agregar rate limiting y validaciones",
  step7: "Crear dashboard de métricas",
  step8: "Implementar notificaciones de admin"
};

export {
  EmailTypes,
  RegistrationEmailFlow,
  EMAIL_TEMPLATES,
  SENDGRID_CONFIG,
  SMTP_CONFIG,
  SECURITY_BEST_PRACTICES,
  EmailMetrics,
  IMPLEMENTATION_STEPS
};
