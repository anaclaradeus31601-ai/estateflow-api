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
import { CreatePropertyamenityDto } from '../dto/create-propertyamenity.dto';
import { UpdatePropertyamenityDto } from '../dto/update-propertyamenity.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { PropertyamenityAdminService } from './propertyamenity-admin.service';

@ApiTags('admin/propertyamenity')
@ApiBearerAuth()
@Controller('admin/propertyamenity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyamenityAdminController {
  constructor(
    private readonly propertyamenityService: PropertyamenityAdminService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Vincular comodidade a imóvel' })
  @ApiResponse({ status: 201, description: 'Vínculo criado' })
  create(@Body() createPropertyamenityDto: CreatePropertyamenityDto) {
    return this.propertyamenityService.create(createPropertyamenityDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar vínculo imóvel-comodidade' })
  @ApiParam({ name: 'id', description: 'ID do vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo atualizado' })
  update(
    @Param('id') id: string,
    @Body() updatePropertyamenityDto: UpdatePropertyamenityDto,
  ) {
    return this.propertyamenityService.update(id, updatePropertyamenityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover vínculo imóvel-comodidade' })
  @ApiParam({ name: 'id', description: 'ID do vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo removido' })
  remove(@Param('id') id: string) {
    return this.propertyamenityService.remove(id);
  }
}
