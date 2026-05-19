import { Controller, Get, Param } from '@nestjs/common';
import { AmenityPublicService } from './amenity-public.service';

@Controller('amenity')
export class AmenityPublicController {
  constructor(private readonly amenityService: AmenityPublicService) {}

  @Get()
  findAll() {
    return this.amenityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.amenityService.findOne(id);
  }
}
