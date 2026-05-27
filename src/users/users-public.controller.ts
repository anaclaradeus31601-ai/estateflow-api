import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
  Patch,
  Body,
  Post,
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
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersPublicService } from './users-public.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { PublicRegisterUserDto } from './dto/public-register-user.dto';
import { PublicUpdateProfileDto } from './dto/public-update-profile.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
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

  @Post('verify-email/request')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Solicitar verificacao de e-mail' })
  @ApiResponse({ status: 201, description: 'Solicitacao registrada' })
  requestEmailVerification(
    @Body() requestEmailVerificationDto: RequestEmailVerificationDto,
  ) {
    return this.usersService.requestEmailVerification(
      requestEmailVerificationDto.email,
    );
  }

  @Post('verify-email/confirm')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Confirmar verificacao de e-mail' })
  @ApiResponse({ status: 201, description: 'E-mail verificado com sucesso' })
  confirmEmailVerification(
    @Body() confirmEmailVerificationDto: ConfirmEmailVerificationDto,
  ) {
    return this.usersService.confirmEmailVerification(
      confirmEmailVerificationDto.token,
    );
  }

  @Post('forgot-password/request')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiResponse({ status: 201, description: 'Solicitação registrada' })
  requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.usersService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('forgot-password/confirm')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Confirmar recuperação de senha' })
  @ApiResponse({ status: 201, description: 'Senha redefinida com sucesso' })
  confirmPasswordReset(
    @Body() confirmPasswordResetDto: ConfirmPasswordResetDto,
  ) {
    return this.usersService.confirmPasswordReset(
      confirmPasswordResetDto.token,
      confirmPasswordResetDto.newPassword,
    );
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
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() updateUserDto: PublicUpdateProfileDto,
  ) {
    return this.usersService.update(user.sub, updateUserDto);
  }

  @Patch('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
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
