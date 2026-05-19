import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { type AuthUser } from './types/auth-user.type';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 201, description: 'Tokens de acesso gerados' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() body: LoginDto, @Req() req: Request) {
    return this.authService.login(body.email, body.password, req);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 201, description: 'Novo access token' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão' })
  @ApiResponse({ status: 201, description: 'Logout realizado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.sub);
  }
}
