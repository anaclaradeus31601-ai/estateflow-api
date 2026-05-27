import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UploadedFile,
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
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { UsersAdminService } from './users-admin.service';
import {
  buildImageUploadOptions,
  buildPublicUploadPath,
} from 'src/common/upload/image-upload';

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersAdminController {
  constructor(private readonly usersService: UsersAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Criar usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createUserDto: AdminCreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  update(@Param('id') id: string, @Body() updateUserDto: AdminUpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/avatar')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('avatar', buildImageUploadOptions('avatars')),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiOperation({ summary: 'Atualizar avatar de um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Avatar atualizado' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  updateAvatar(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (!avatar) {
      throw new BadRequestException('Avatar file is required');
    }

    return this.usersService.updateAvatar(
      id,
      buildPublicUploadPath('avatars', avatar.filename),
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
