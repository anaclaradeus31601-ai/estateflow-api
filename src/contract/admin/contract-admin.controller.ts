import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContractAdminService } from './contract-admin.service';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@ApiTags('admin/contract')
@ApiBearerAuth()
@Controller('admin/contract')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractAdminController {
  constructor(private readonly contractService: ContractAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar contrato' })
  @ApiResponse({ status: 201, description: 'Contrato criado' })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar contrato' })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ status: 200, description: 'Contrato atualizado' })
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(id, updateContractDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover contrato' })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ status: 200, description: 'Contrato removido' })
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}
