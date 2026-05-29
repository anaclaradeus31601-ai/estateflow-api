import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Auth } from 'src/auth/guard/auth.guard';
import type { AuthUser } from 'src/auth/types/auth-user.type';

import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindConversationsDto } from './dto/find-conversations.dto';
import { FindMessagesDto } from './dto/find-messages.dto';
import { MarkMessageReadDto } from './dto/mark-message-read.dto';
import { SetConversationStatusDto } from './dto/set-conversation-status.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Auth(UserRole.ADMIN, UserRole.CLIENT, UserRole.REALTOR)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Criar uma nova conversa entre cliente e corretor' })
  @ApiResponse({ status: 201, description: 'Conversa criada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário ou imóvel não encontrado' })
  @ApiResponse({ status: 409, description: 'Conversa já existente' })
  createConversation(
    @CurrentUser() user: AuthUser,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user.sub, createConversationDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar minhas conversas' })
  @ApiResponse({ status: 200, description: 'Conversas retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findMyConversations(
    @CurrentUser() user: AuthUser,
    @Query() filters: FindConversationsDto,
  ) {
    return this.chatService.findMyConversations(user.sub, filters);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obter detalhes de uma conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Conversa encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para esta conversa' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  findConversationById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.chatService.findConversationById(user.sub, id);
  }

  @Patch('conversations/:id/status')
  @ApiOperation({ summary: 'Alterar o status de uma conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para esta conversa' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  setConversationStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() setConversationStatusDto: SetConversationStatusDto,
  ) {
    return this.chatService.setConversationStatus(
      user.sub,
      id,
      setConversationStatusDto,
    );
  }

  @Post('messages')
  @ApiOperation({ summary: 'Enviar mensagem para uma conversa' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para esta conversa' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  createMessage(
    @CurrentUser() user: AuthUser,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(user.sub, createMessageDto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Listar mensagens de uma conversa' })
  @ApiQuery({
    name: 'conversationId',
    required: true,
    description: 'ID da conversa para listar mensagens',
  })
  @ApiResponse({ status: 200, description: 'Mensagens retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para esta conversa' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  findMessages(
    @CurrentUser() user: AuthUser,
    @Query() filters: FindMessagesDto,
  ) {
    return this.chatService.findMessages(user.sub, filters);
  }

  @Patch('messages/read')
  @ApiOperation({ summary: 'Marcar mensagem como lida' })
  @ApiResponse({ status: 200, description: 'Mensagem marcada como lida' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para esta conversa' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada' })
  markMessageAsRead(
    @CurrentUser() user: AuthUser,
    @Body() markMessageReadDto: MarkMessageReadDto,
  ) {
    return this.chatService.markMessageAsRead(user.sub, markMessageReadDto);
  }
}
