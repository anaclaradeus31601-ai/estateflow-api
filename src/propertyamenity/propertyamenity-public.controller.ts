import { Controller, Get, Param } from '@nestjs/common';
import { PropertyamenityPublicService } from './propertyamenity-public.service';

@Controller('propertyamenity')
export class PropertyamenityPublicController {
  constructor(private readonly propertyamenityService: PropertyamenityPublicService) {}

  @Get()
  findAll() {
    return this.propertyamenityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyamenityService.findOne(id);
  }
}
