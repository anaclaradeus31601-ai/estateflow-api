import { Module } from '@nestjs/common';
import { UsersAdminService } from './admin/users-admin.service';
import { UsersAdminController } from './admin/users-admin.controller';
import { UsersPublicService } from './users-public.service';
import { UsersPublicController } from './users-public.controller';

@Module({
  controllers: [UsersAdminController, UsersPublicController],
  providers: [UsersAdminService, UsersPublicService],
})
export class UsersModule {}
