import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminPaymentValidationController } from './admin-payment-validation.controller';
import { AdminPaymentValidationService } from './admin-payment-validation.service';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Account, AccountSchema } from '../services/schemas/account.schema';
import { AccountsService } from '../services/accounts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  controllers: [AdminPaymentValidationController],
  providers: [AdminPaymentValidationService, AccountsService],
  exports: [AdminPaymentValidationService],
})
export class AdminPaymentValidationModule {}
