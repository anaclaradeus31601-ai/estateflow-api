import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    example: 'convxxxxxxxxxxxxxxx',
    description: 'Identificador da conversa',
  })
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @ApiProperty({
    example: 'Olá! Podemos remarcar para amanhã às 15h?',
    description: 'Conteúdo textual da mensagem',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 4000)
  content!: string;
}
