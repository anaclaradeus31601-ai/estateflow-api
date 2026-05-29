import { Module } from '@nestjs/common';
import { VisitAdminService } from './admin/visit-admin.service';
import { VisitAdminController } from './admin/visit-admin.controller';
import { VisitPublicService } from './visit-public.service';
import { VisitPublicController } from './visit-public.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [VisitAdminController, VisitPublicController],
  providers: [VisitAdminService, VisitPublicService],
})
export class VisitModule {}
