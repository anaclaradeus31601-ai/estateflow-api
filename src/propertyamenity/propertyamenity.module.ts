import { Module } from '@nestjs/common';
import { PropertyamenityAdminService } from './admin/propertyamenity-admin.service';
import { PropertyamenityAdminController } from './admin/propertyamenity-admin.controller';
import { PropertyamenityPublicService } from './propertyamenity-public.service';
import { PropertyamenityPublicController } from './propertyamenity-public.controller';

@Module({
  controllers: [
    PropertyamenityAdminController,
    PropertyamenityPublicController,
  ],
  providers: [PropertyamenityAdminService, PropertyamenityPublicService],
})
export class PropertyamenityModule {}
