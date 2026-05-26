import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PropertyamenityPublicService } from './propertyamenity-public.service';

@ApiTags('propertyamenity')
@Controller('propertyamenity')
export class PropertyamenityPublicController {
  constructor(
    private readonly propertyamenityService: PropertyamenityPublicService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar comodidades dos imóveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de vínculos imóvel-comodidade',
  })
  findAll() {
    return this.propertyamenityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar vínculo imóvel-comodidade por ID' })
  @ApiParam({ name: 'id', description: 'ID do vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo encontrado' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.propertyamenityService.findOne(id);
  }
}
