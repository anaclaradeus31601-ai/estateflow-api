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
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { OwnerAdminService } from './owner-admin.service';

@ApiTags('admin/owner')
@ApiBearerAuth()
@Controller('admin/owner')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OwnerAdminController {
  constructor(private readonly ownerService: OwnerAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar proprietário' })
  @ApiResponse({ status: 201, description: 'Proprietário criado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerService.create(createOwnerDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar proprietário' })
  @ApiParam({ name: 'id', description: 'ID do proprietário' })
  @ApiResponse({ status: 200, description: 'Proprietário atualizado' })
  @ApiResponse({ status: 404, description: 'Proprietário não encontrado' })
  update(@Param('id') id: string, @Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownerService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover proprietário' })
  @ApiParam({ name: 'id', description: 'ID do proprietário' })
  @ApiResponse({ status: 200, description: 'Proprietário removido' })
  @ApiResponse({ status: 404, description: 'Proprietário não encontrado' })
  remove(@Param('id') id: string) {
    return this.ownerService.remove(id);
  }
}
