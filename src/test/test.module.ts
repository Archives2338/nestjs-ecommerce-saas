import { Module } from '@nestjs/common';
import { TestEmailController } from './test-email.controller';
import { TestSMTPController } from './test-smtp.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [
    TestEmailController,
    TestSMTPController
  ],
})
export class TestModule {}
