import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnerPublicService } from './owner-public.service';

@ApiTags('owner')
@Controller('owner')
export class OwnerPublicController {
  constructor(private readonly ownerService: OwnerPublicService) {}

  @Get()
  @ApiOperation({ summary: 'Listar proprietários' })
  @ApiResponse({ status: 200, description: 'Lista de proprietários' })
  findAll() {
    return this.ownerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar proprietário por ID' })
  @ApiParam({ name: 'id', description: 'ID do proprietário' })
  @ApiResponse({ status: 200, description: 'Proprietário encontrado' })
  @ApiResponse({ status: 404, description: 'Proprietário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.ownerService.findOne(id);
  }
}
