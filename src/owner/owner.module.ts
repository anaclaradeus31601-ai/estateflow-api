import { Module } from '@nestjs/common';
import { OwnerAdminService } from './admin/owner-admin.service';
import { OwnerAdminController } from './admin/owner-admin.controller';
import { OwnerPublicService } from './owner-public.service';
import { OwnerPublicController } from './owner-public.controller';

@Module({
  controllers: [OwnerAdminController, OwnerPublicController],
  providers: [OwnerAdminService, OwnerPublicService],
})
export class OwnerModule {}
