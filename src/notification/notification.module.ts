import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './events/notification.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
   providers: [
    NotificationService,
    NotificationGateway
  ],
  exports: [NotificationService],
  controllers: [NotificationController]
})
export class NotificationModule {}
