import { ConversationStatus, UserRole } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FindConversationsDto {
  @ApiPropertyOptional({
    example: 'propxxxxxxxxxxxxxx',
    description: 'Filtrar por imóvel relacionado',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    example: 'clxxxxxxxxxxxxxxxx',
    description: 'Filtrar por participante específico',
  })
  @IsOptional()
  @IsString()
  participantId?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.CLIENT,
    description: 'Papel do participante para filtrar a listagem',
  })
  @IsOptional()
  @IsEnum(UserRole)
  participantRole?: UserRole;

  @ApiPropertyOptional({
    enum: ConversationStatus,
    example: ConversationStatus.OPEN,
    description: 'Filtrar por status da conversa',
  })
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @ApiPropertyOptional({
    example: 'remarcação visita',
    description: 'Busca textual por nome do imóvel ou prévia da última mensagem',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
