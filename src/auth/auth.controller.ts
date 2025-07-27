import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignProcessDto, CodeSignDto } from './dto/auth.dto';

@Controller('authorize')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('sign_process')
  async signProcess(@Body() signProcessDto: SignProcessDto) {
    try {
      this.logger.log(`Sign process request for email: ${signProcessDto.email}`);
      const result = await this.authService.signProcess(signProcessDto);
      this.logger.log(`Sign process completed for: ${signProcessDto.email}`);
      return result;
    } catch (error) {
      this.logger.error('Error in sign_process:', error);
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

  @Post('code_sign')
  async codeSign(@Body() codeSignDto: CodeSignDto) {
    try {
      this.logger.log(`Code verification request for email: ${codeSignDto.email}`);
      const result = await this.authService.codeSign(codeSignDto);
      this.logger.log(`Code verification completed for: ${codeSignDto.email}`);
      return result;
    } catch (error) {
      this.logger.error('Error in code_sign:', error);
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
}
