import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { VerificationCode, VerificationCodeDocument } from './schemas/verification-code.schema';
import { SignProcessDto, CodeSignDto } from './dto/auth.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(VerificationCode.name) private verificationCodeModel: Model<VerificationCodeDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signProcess(signProcessDto: SignProcessDto) {
    try {
      const { email, language, redirect_uri } = signProcessDto;
      
      this.logger.log(`Processing sign request for email: ${email}`);

      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findOne({ email }).exec();

      if (existingUser) {
        // Usuario existe - flujo de login
        this.logger.log(`User exists, initiating login flow for: ${email}`);
        
        // Generar y enviar código de verificación
        const verificationCode = await this.generateVerificationCode(email, 'login');
        const emailSent = await this.emailService.sendVerificationCode(email, verificationCode, language);

        if (!emailSent) {
          return {
            code: 1,
            message: 'Error al enviar código de verificación',
            toast: 1,
            redirect_url: '',
            type: 'error',
            data: []
          };
        }

        return {
          code: 0,
          message: 'Con éxito',
          toast: 0,
          redirect_url: '',
          type: 'success',
          data: {
            process: 2, // 2 = login existente
            register_type: 0
          }
        };
      } else {
        // Usuario no existe - flujo de registro
        this.logger.log(`New user, initiating registration flow for: ${email}`);
        
        return {
          code: 0,
          message: 'Con éxito',
          toast: 0,
          redirect_url: '',
          type: 'success',
          data: {
            process: 1, // 1 = registro nuevo
            register_type: 1
          }
        };
      }
    } catch (error) {
      this.logger.error('Error in signProcess:', error);
      return {
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: []
      };
    }
  }

  async codeSign(codeSignDto: CodeSignDto) {
    try {
      const { email, code, language, redirect_uri, agreeTC } = codeSignDto;
      
      this.logger.log(`Processing code verification for email: ${email}`);

      // Verificar el código
      const isValidCode = await this.verifyCode(email, code);
      
      if (!isValidCode) {
        return {
          code: 1012,
          message: 'código de verificación incorrecto [#1012]',
          toast: 1,
          redirect_url: '',
          type: 'error',
          data: []
        };
      }

      // Buscar o crear usuario
      let user = await this.userModel.findOne({ email }).exec();
      
      if (!user) {
        // Crear nuevo usuario
        user = new this.userModel({
          email,
          isEmailVerified: true,
          preferredLanguage: language,
          lastLoginAt: new Date()
        });
        await user.save();
        this.logger.log(`New user created: ${email}`);
      } else {
        // Actualizar último login
        user.lastLoginAt = new Date();
        user.isEmailVerified = true;
        await user.save();
        this.logger.log(`User login updated: ${email}`);
      }

      // Generar JWT token
      const token = this.jwtService.sign({
        sub: user._id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      });

      // Marcar código como usado
      await this.markCodeAsUsed(email, code);

      return {
        code: 0,
        message: 'Autenticación exitosa',
        toast: 0,
        redirect_url: redirect_uri,
        type: 'success',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            preferredLanguage: user.preferredLanguage
          }
        }
      };
    } catch (error) {
      this.logger.error('Error in codeSign:', error);
      return {
        code: 1,
        message: 'Error interno del servidor',
        toast: 1,
        redirect_url: '',
        type: 'error',
        data: []
      };
    }
  }

  private async generateVerificationCode(email: string, type: string): Promise<string> {
    // Generar código de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Expiración en 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Eliminar códigos anteriores no usados para este email
    await this.verificationCodeModel.deleteMany({ 
      email, 
      type,
      isUsed: false 
    }).exec();

    // Crear nuevo código
    const verificationCode = new this.verificationCodeModel({
      email,
      code,
      type,
      expiresAt
    });

    await verificationCode.save();
    this.logger.log(`Verification code generated for ${email}`);
    
    return code;
  }

  private async verifyCode(email: string, code: string): Promise<boolean> {
    const verificationCode = await this.verificationCodeModel.findOne({
      email,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).exec();

    return !!verificationCode;
  }

  private async markCodeAsUsed(email: string, code: string): Promise<void> {
    await this.verificationCodeModel.updateOne(
      { email, code, isUsed: false },
      { isUsed: true }
    ).exec();
  }

  async validateUser(payload: any): Promise<any> {
    const user = await this.userModel.findById(payload.sub).exec();
    if (user && user.isActive) {
      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
    }
    return null;
  }
}
