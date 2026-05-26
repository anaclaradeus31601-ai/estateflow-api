import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
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
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildAccessTokenCookieOptions,
  buildExpiredCookieOptions,
  buildRefreshTokenCookieOptions,
} from './auth.constants';
import { Throttle } from '@nestjs/throttler';

type CookieRequest = Request & {
  cookies?: unknown;
};

function getCookieValue(
  request: CookieRequest,
  cookieName: string,
): string | undefined {
  const cookies = request.cookies;
  if (!cookies || typeof cookies !== 'object') {
    return undefined;
  }

  const cookieValue = (cookies as Record<string, unknown>)[cookieName];
  return typeof cookieValue === 'string' ? cookieValue : undefined;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 201, description: 'Tokens de acesso gerados' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(body.email, body.password, req);

    res.cookie(
      ACCESS_TOKEN_COOKIE,
      tokens.access_token,
      buildAccessTokenCookieOptions(),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      tokens.refresh_token,
      buildRefreshTokenCookieOptions(),
    );

    return {
      message: 'Login realizado com sucesso',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 201, description: 'Novo access token' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() req: CookieRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieRefreshToken = getCookieValue(req, REFRESH_TOKEN_COOKIE);
    const refreshToken = cookieRefreshToken ?? body.refresh_token;

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie(
      ACCESS_TOKEN_COOKIE,
      tokens.access_token,
      buildAccessTokenCookieOptions(),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      tokens.refresh_token,
      buildRefreshTokenCookieOptions(),
    );

    return {
      message: 'Token renovado com sucesso',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão' })
  @ApiResponse({ status: 201, description: 'Logout realizado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user.sub);

    res.cookie(ACCESS_TOKEN_COOKIE, '', buildExpiredCookieOptions());
    res.cookie(REFRESH_TOKEN_COOKIE, '', buildExpiredCookieOptions());

    return result;
  }
}
