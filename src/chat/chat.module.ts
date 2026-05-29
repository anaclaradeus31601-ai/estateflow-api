import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';

import { ChatController } from './chat.controller';
import { ChatGateway } from './events/chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
