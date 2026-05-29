import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersAdminService } from './admin/users-admin.service';
import { UsersAdminController } from './admin/users-admin.controller';
import { UsersPublicService } from './users-public.service';
import { UsersPublicController } from './users-public.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [JwtModule, NotificationModule],
  controllers: [UsersAdminController, UsersPublicController],
  providers: [UsersAdminService, UsersPublicService],
})
export class UsersModule {}
