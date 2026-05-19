import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseFloatPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminPropertyService } from './admin-property.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin/property')
@ApiBearerAuth()
@Controller('admin/property')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPropertyController {
  constructor(private readonly propertyService: AdminPropertyService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar imóvel' })
  @ApiResponse({ status: 201, description: 'Imóvel criado' })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar imóvel' })
  @ApiParam({ name: 'id', description: 'ID do imóvel' })
  @ApiResponse({ status: 200, description: 'Imóvel atualizado' })
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover imóvel' })
  @ApiParam({ name: 'id', description: 'ID do imóvel' })
  @ApiResponse({ status: 200, description: 'Imóvel removido' })
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
