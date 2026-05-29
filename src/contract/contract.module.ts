import { Module } from '@nestjs/common';
import { ContractAdminService } from './admin/contract-admin.service';
import { ContractAdminController } from './admin/contract-admin.controller';
import { ContractPublicService } from './contract-public.service';
import { ContractPublicController } from './contract-public.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [ContractAdminController, ContractPublicController],
  providers: [ContractAdminService, ContractPublicService],
})
export class ContractModule {}
