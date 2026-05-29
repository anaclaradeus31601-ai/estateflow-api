import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FindMessagesDto {
  @ApiPropertyOptional({
    example: 'convxxxxxxxxxxxxxxx',
    description: 'Filtrar mensagens de uma conversa específica',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({
    example: 'msgxxxxxxxxxxxxxxxx',
    description: 'Cursor opcional para paginação incremental',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    default: 50,
    minimum: 1,
    maximum: 200,
    description: 'Quantidade máxima de mensagens retornadas',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({
    default: false,
    description: 'Quando verdadeiro, retorna apenas mensagens não lidas',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unreadOnly?: boolean = false;
}
