import { Module } from '@nestjs/common';
import { AmenityAdminService } from './admin/amenity-admin.service';
import { AmenityAdminController } from './admin/amenity-admin.controller';
import { AmenityPublicService } from './amenity-public.service';
import { AmenityPublicController } from './amenity-public.controller';

@Module({
  controllers: [AmenityAdminController, AmenityPublicController],
  providers: [AmenityAdminService, AmenityPublicService],
})
export class AmenityModule {}
