import { Module } from '@nestjs/common';
import { FavoritePublicController } from './favorite-public.controller';
import { FavoritePublicService } from './favorite-public.service';

@Module({
  controllers: [FavoritePublicController],
  providers: [FavoritePublicService],
})
export class FavoriteModule {}
