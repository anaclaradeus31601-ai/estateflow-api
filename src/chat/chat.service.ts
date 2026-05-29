import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConversationStatus, Prisma, UserRole } from '@prisma/client';

import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { FindConversationsDto } from './dto/find-conversations.dto';
import { FindMessagesDto } from './dto/find-messages.dto';
import { MarkMessageReadDto } from './dto/mark-message-read.dto';
import { SetConversationStatusDto } from './dto/set-conversation-status.dto';
import { ChatGateway } from './events/chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) {}

  private async ensureUserRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new EntityNotFoundException('Usuário', userId);
    }

    if (user.role !== role) {
      throw new ForbiddenException(`O usuário ${userId} não possui o perfil ${role}`);
    }

    return user;
  }

  private async ensurePropertyExists(propertyId?: string) {
    if (!propertyId) {
      return null;
    }

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!property) {
      throw new EntityNotFoundException('Imóvel', propertyId);
    }

    return property;
  }

  private async getConversationOrThrow(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        realtor: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        property: {
          select: { id: true, title: true },
        },
      },
    });

    if (!conversation) {
      throw new EntityNotFoundException('Conversa', id);
    }

    return conversation;
  }

  private assertConversationParticipant(userId: string, conversation: { clientId: string; realtorId: string }) {
    if (conversation.clientId !== userId && conversation.realtorId !== userId) {
      throw new ForbiddenException('Você não participa desta conversa');
    }
  }

  private async findExistingConversation(dto: CreateConversationDto) {
    return this.prisma.conversation.findFirst({
      where: {
        clientId: dto.clientId,
        realtorId: dto.realtorId,
        propertyId: dto.propertyId ?? null,
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        realtor: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        property: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async createConversation(createdById: string, dto: CreateConversationDto) {
    const initialMessage = dto.initialMessage?.trim();

    await this.ensureUserRole(dto.clientId, UserRole.CLIENT);
    await this.ensureUserRole(dto.realtorId, UserRole.REALTOR);
    await this.ensurePropertyExists(dto.propertyId);

    const createdBy = await this.prisma.user.findUnique({
      where: { id: createdById },
      select: { id: true, role: true },
    });

    if (!createdBy) {
      throw new EntityNotFoundException('Usuário', createdById);
    }

    if (
      createdBy.role !== UserRole.ADMIN &&
      ![dto.clientId, dto.realtorId].includes(createdById)
    ) {
      throw new ForbiddenException('A conversa deve ser criada por um dos participantes');
    }

    const existingConversation = await this.findExistingConversation(dto);

    if (existingConversation) {
      throw new EntityAlreadyExistsException('Conversa já existente entre este cliente e corretor');
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        clientId: dto.clientId,
        realtorId: dto.realtorId,
        createdById,
        propertyId: dto.propertyId ?? null,
        lastMessageAt: initialMessage ? new Date() : null,
        lastMessagePreview: initialMessage ? initialMessage.slice(0, 160) : null,
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        realtor: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        property: {
          select: { id: true, title: true },
        },
      },
    });

    if (initialMessage) {
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: createdById,
          content: initialMessage,
        },
      });
    }

    await this.chatGateway.emitConversationCreated(
      [conversation.clientId, conversation.realtorId],
      conversation,
    );

    return conversation;
  }

  async findConversationById(userId: string, id: string) {
    const conversation = await this.getConversationOrThrow(id);
    this.assertConversationParticipant(userId, conversation);
    return conversation;
  }

  async findMyConversations(userId: string, filters: FindConversationsDto) {
    const where: Prisma.ConversationWhereInput = {
      OR: [{ clientId: userId }, { realtorId: userId }],
      ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.participantId && filters.participantRole === UserRole.CLIENT
        ? { clientId: filters.participantId }
        : {}),
      ...(filters.participantId && filters.participantRole === UserRole.REALTOR
        ? { realtorId: filters.participantId }
        : {}),
    };

    if (filters.search) {
      where.AND = [
        {
          OR: [
            { lastMessagePreview: { contains: filters.search, mode: 'insensitive' } },
            { property: { title: { contains: filters.search, mode: 'insensitive' } } },
            { client: { name: { contains: filters.search, mode: 'insensitive' } } },
            { realtor: { name: { contains: filters.search, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    return this.prisma.conversation.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        realtor: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        property: {
          select: { id: true, title: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
        },
      },
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
      take: filters.limit,
    });
  }

  async setConversationStatus(userId: string, conversationId: string, dto: SetConversationStatusDto) {
    const conversation = await this.getConversationOrThrow(conversationId);
    this.assertConversationParticipant(userId, conversation);

    if (conversation.status === dto.status) {
      throw new BadRequestException(`A conversa já está com o status ${dto.status}`);
    }

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: dto.status },
      include: {
        client: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        realtor: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
        property: {
          select: { id: true, title: true },
        },
      },
    });

    await this.chatGateway.emitConversationUpdated(
      [updatedConversation.clientId, updatedConversation.realtorId],
      updatedConversation,
    );

    return updatedConversation;
  }

  async sendMessage(senderId: string, dto: CreateMessageDto) {
    const content = dto.content.trim();

    if (!content) {
      throw new BadRequestException('A mensagem não pode estar vazia');
    }

    const conversation = await this.getConversationOrThrow(dto.conversationId);
    this.assertConversationParticipant(senderId, conversation);

    if (conversation.status === ConversationStatus.ARCHIVED) {
      throw new ForbiddenException('Não é possível enviar mensagem em conversa arquivada');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessagePreview: content.slice(0, 160),
        status: ConversationStatus.OPEN,
      },
    });

    await this.chatGateway.emitMessageCreated(
      dto.conversationId,
      [conversation.clientId, conversation.realtorId],
      message,
    );

    return message;
  }

  async findMessages(userId: string, filters: FindMessagesDto) {
    if (!filters.conversationId) {
      throw new ForbiddenException('conversationId é obrigatório para listar mensagens');
    }

    const conversation = await this.getConversationOrThrow(filters.conversationId);
    this.assertConversationParticipant(userId, conversation);

    let cursorCreatedAt: Date | undefined;

    if (filters.cursor) {
      const cursorMessage = await this.prisma.message.findUnique({
        where: { id: filters.cursor },
        select: {
          id: true,
          conversationId: true,
          createdAt: true,
        },
      });

      if (!cursorMessage) {
        throw new EntityNotFoundException('Mensagem', filters.cursor);
      }

      if (cursorMessage.conversationId !== filters.conversationId) {
        throw new ForbiddenException('O cursor não pertence a esta conversa');
      }

      cursorCreatedAt = cursorMessage.createdAt;
    }

    return this.prisma.message.findMany({
      where: {
        conversationId: filters.conversationId,
        ...(filters.unreadOnly ? { isRead: false } : {}),
        ...(cursorCreatedAt
          ? {
              createdAt: {
                lt: cursorCreatedAt,
              },
            }
          : {}),
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit,
    });
  }

  async markMessageAsRead(userId: string, dto: MarkMessageReadDto) {
    const message = await this.prisma.message.findUnique({
      where: { id: dto.messageId },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      throw new EntityNotFoundException('Mensagem', dto.messageId);
    }

    this.assertConversationParticipant(userId, message.conversation);

    if (message.isRead) {
      return message;
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: dto.messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    await this.chatGateway.emitMessageRead(
      message.conversationId,
      [message.conversation.clientId, message.conversation.realtorId],
      {
        messageId: updatedMessage.id,
        conversationId: message.conversationId,
        readAt: updatedMessage.readAt,
      },
    );

    return updatedMessage;
  }
}
