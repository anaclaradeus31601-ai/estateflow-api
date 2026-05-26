import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Body,
  Post,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersPublicService } from './users-public.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { PublicRegisterUserDto } from './dto/public-register-user.dto';
import { Throttle } from '@nestjs/throttler';
import {
  buildImageUploadOptions,
  buildPublicUploadPath,
} from 'src/common/upload/image-upload';

@ApiTags('users')
@Controller('users')
export class UsersPublicController {
  constructor(private readonly usersService: UsersPublicService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Cadastrar cliente publicamente' })
  @ApiResponse({ status: 201, description: 'Cliente cadastrado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  register(@Body() publicRegisterUserDto: PublicRegisterUserDto) {
    return this.usersService.register(publicRegisterUserDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.findOne(user.sub);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.sub, updateUserDto);
  }

  @Patch('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Atualizar avatar do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Avatar atualizado' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  updateMyAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (!avatar) {
      throw new BadRequestException('Avatar file is required');
    }

    return this.usersService.updateAvatar(
      user.sub,
      buildPublicUploadPath('avatars', avatar.filename),
    );
  }
}
