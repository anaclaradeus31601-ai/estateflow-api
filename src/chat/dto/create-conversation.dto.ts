import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    example: 'clxxxxxxxxxxxxxxxx',
    description: 'Identificador do cliente participante da conversa',
  })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({
    example: 'clyyyyyyyyyyyyyyyy',
    description: 'Identificador do corretor participante da conversa',
  })
  @IsString()
  @IsNotEmpty()
  realtorId!: string;

  @ApiPropertyOptional({
    example: 'propxxxxxxxxxxxxxx',
    description: 'Imóvel relacionado à conversa, se houver',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    example: 'Olá! Tenho interesse em visitar este imóvel ainda esta semana.',
    description: 'Mensagem inicial opcional para abrir a conversa',
  })
  @IsOptional()
  @IsString()
  @Length(1, 4000)
  initialMessage?: string;
}
