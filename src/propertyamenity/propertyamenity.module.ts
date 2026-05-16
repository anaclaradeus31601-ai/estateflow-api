import { Module } from '@nestjs/common';
import { PropertyamenityService } from './propertyamenity.service';
import { PropertyamenityController } from './propertyamenity.controller';

@Module({
  controllers: [PropertyamenityController],
  providers: [PropertyamenityService],
})
export class PropertyamenityModule {}
