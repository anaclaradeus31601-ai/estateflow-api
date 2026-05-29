import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MarkMessageReadDto {
  @ApiProperty({
    example: 'msgxxxxxxxxxxxxxxxx',
    description: 'Mensagem que deve ser marcada como lida',
  })
  @IsString()
  @IsNotEmpty()
  messageId!: string;
}
