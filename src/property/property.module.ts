import { Module } from '@nestjs/common';
import {  AdminPropertyService } from './admin/admin-property.service';
import {  AdminPropertyController } from './admin/admin-property.controller';
import { PropertyController } from './public-property.controller';
import { PropertyService } from './public-property.service';

@Module({
  controllers: [PropertyController, AdminPropertyController],
  providers: [PropertyService, AdminPropertyService],
})
export class PropertyModule {}

//quando o modulo iniciar popular a tabela 
