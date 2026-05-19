import { Controller, Get, Param } from '@nestjs/common';
import { OwnerPublicService } from './owner-public.service';

@Controller('owner')
export class OwnerPublicController {
  constructor(private readonly ownerService: OwnerPublicService) {}

  @Get()
  findAll() {
    return this.ownerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ownerService.findOne(id);
  }
}
