import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminPropertyService } from './admin-property.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  buildImageUploadOptions,
  buildPublicUploadPath,
} from 'src/common/upload/image-upload';

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

  @Post(':id/images')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, buildImageUploadOptions('properties')),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['images'],
    },
  })
  @ApiOperation({ summary: 'Adicionar imagens a um imóvel' })
  @ApiParam({ name: 'id', description: 'ID do imóvel' })
  @ApiResponse({ status: 201, description: 'Imagens adicionadas' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }

    return this.propertyService.addImages(
      id,
      images.map((image) =>
        buildPublicUploadPath('properties', image.filename),
      ),
    );
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
