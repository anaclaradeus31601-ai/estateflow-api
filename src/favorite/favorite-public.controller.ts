import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { FavoritePublicService } from './favorite-public.service';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritePublicController {
  constructor(private readonly favoriteService: FavoritePublicService) {}

  @Get()
  @ApiOperation({ summary: 'Listar imóveis favoritos do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos retornada com sucesso' })
  findMyFavorites(@CurrentUser() user: AuthUser) {
    return this.favoriteService.findByUser(user.sub);
  }

  @Post(':propertyId')
  @ApiOperation({ summary: 'Adicionar um imóvel aos favoritos' })
  @ApiParam({ name: 'propertyId', description: 'ID do imóvel' })
  @ApiResponse({ status: 201, description: 'Imóvel favoritado com sucesso' })
  addFavorite(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.favoriteService.add(user.sub, propertyId);
  }

  @Delete(':propertyId')
  @ApiOperation({ summary: 'Remover um imóvel dos favoritos' })
  @ApiParam({ name: 'propertyId', description: 'ID do imóvel' })
  @ApiResponse({ status: 200, description: 'Imóvel removido dos favoritos com sucesso' })
  removeFavorite(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.favoriteService.remove(user.sub, propertyId);
  }
}
