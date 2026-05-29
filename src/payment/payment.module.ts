import { Module } from '@nestjs/common';
import { PaymentAdminService } from './admin/payment-admin.service';
import { PaymentAdminController } from './admin/payment-admin.controller';
import { PaymentPublicService } from './payment-public.service';
import { PaymentPublicController } from './payment-public.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [PaymentAdminController, PaymentPublicController],
  providers: [PaymentAdminService, PaymentPublicService],
})
export class PaymentModule {}
