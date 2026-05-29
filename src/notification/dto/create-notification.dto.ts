import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'clxxxxxxxxxxxxxxxx',
    description: 'Identificador do usuário',
  })
  userId?: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'Seu imóvel favorito teve queda de preço.',
    description: 'Mensagem da notificação',
  })
  message?: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'Queda de preço',
    description: 'Título da notificação',
  })
  title?: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'PRICE_DROPPED',
    description: 'Tipo/classificação da notificação',
  })
  type?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    example: {
      propertyId: 'clxxxxxxxxxxxxxxxx',
      oldPrice: 350000,
      newPrice: 320000,
    },
    description: 'Payload adicional da notificação',
  })
  data?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    example: '2023-08-01T10:00:00.000Z',
    description: 'Data em que a notificação foi lida',
  })
  readAt?: string;
}
