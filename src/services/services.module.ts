import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
// import { AccountsController } from '../accounts/accounts.controller';
// import { AccountsService } from '../accounts/accounts.service';
import { Service, ServiceSchema } from './schemas/service.schema';
import { Account, AccountSchema } from './schemas/account.schema';
import { UserOrder, UserOrderSchema } from './schemas/user-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: Account.name, schema: AccountSchema },
      { name: UserOrder.name, schema: UserOrderSchema }
    ])
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class ServicesModule {}
