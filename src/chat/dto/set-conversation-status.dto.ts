import { ConversationStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SetConversationStatusDto {
  @ApiProperty({
    enum: ConversationStatus,
    example: ConversationStatus.ARCHIVED,
    description: 'Novo status da conversa',
  })
  @IsEnum(ConversationStatus)
  @IsNotEmpty()
  status!: ConversationStatus;
}
