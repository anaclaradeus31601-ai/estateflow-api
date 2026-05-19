import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContractPublicService } from './contract-public.service';

@ApiTags('contract')
@Controller('contract')
export class ContractPublicController {
  constructor(private readonly contractService: ContractPublicService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contratos' })
  @ApiResponse({ status: 200, description: 'Lista de contratos' })
  findAll() {
    return this.contractService.findAll();
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Listar contratos por cliente' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Contratos do cliente' })
  findContractsByClient(@Param('clientId') clientId: string) {
    return this.contractService.findContractsByClient(clientId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Listar contratos por imóvel' })
  @ApiParam({ name: 'propertyId', description: 'ID do imóvel' })
  @ApiResponse({ status: 200, description: 'Contratos do imóvel' })
  findContractsByProperty(@Param('propertyId') propertyId: string) {
    return this.contractService.findContractsByProperty(propertyId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Listar contratos próximos do vencimento' })
  @ApiResponse({ status: 200, description: 'Contratos expirando' })
  findExpiringContracts() {
    return this.contractService.findExpiringContracts();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Listar contratos vencidos' })
  @ApiResponse({ status: 200, description: 'Contratos vencidos' })
  findOverdueContracts() {
    return this.contractService.findOverdueContracts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar contrato por ID' })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ status: 200, description: 'Contrato encontrado' })
  @ApiResponse({ status: 404, description: 'Contrato não encontrado' })
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }
}
