import { Injectable } from '@nestjs/common';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  EmailAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class UsersAdminService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  async create(createUserDto: AdminCreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const createdUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        budget: true,
        city: true,
        notes: true,
        role: true,
        avatar: true,
      },
    });

    await this.notification.safeSendNotification({
      userId: createdUser.id,
      type: 'ACCOUNT_CREATED',
      title: 'Conta criada',
      message: `Sua conta foi criada com o perfil ${createdUser.role}.`,
      data: {
        userId: createdUser.id,
        role: createdUser.role,
      },
    });

    await this.notification.notifyAdmins({
      type: 'USER_CREATED',
      title: 'Novo usuário criado',
      message: `O usuário ${createdUser.name} foi criado com o perfil ${createdUser.role}.`,
      data: {
        userId: createdUser.id,
        role: createdUser.role,
      },
    });

    return createdUser;
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        budget: true,
        city: true,
        notes: true,
        role: true,
        avatar: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        budget: true,
        city: true,
        notes: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new EntityNotFoundException('Usuário', id);
    }

    return user;
  }

  async update(id: string, updateUserDto: AdminUpdateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true },
    });

    if (!userExists) {
      throw new EntityNotFoundException('Usuário', id);
    }

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== id) {
        throw new EmailAlreadyExistsException();
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
    } else {
      delete updateUserDto.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        budget: true,
        city: true,
        notes: true,
        role: true,
        avatar: true,
      },
    });

    if (updateUserDto.role && updateUserDto.role !== userExists.role) {
      await this.notification.safeSendNotification({
        userId: updatedUser.id,
        type: 'USER_ROLE_CHANGED',
        title: 'Perfil atualizado',
        message: `Seu perfil foi alterado de ${userExists.role} para ${updatedUser.role}.`,
        data: {
          userId: updatedUser.id,
          oldRole: userExists.role,
          newRole: updatedUser.role,
        },
      });

      await this.notification.notifyAdmins({
        type: 'USER_ROLE_CHANGED',
        title: 'Perfil de usuário alterado',
        message: `O perfil de ${updatedUser.name} foi alterado de ${userExists.role} para ${updatedUser.role}.`,
        data: {
          userId: updatedUser.id,
          oldRole: userExists.role,
          newRole: updatedUser.role,
        },
      });
    }

    return updatedUser;
  }

  async updateAvatar(id: string, avatar: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        budget: true,
        city: true,
        notes: true,
        role: true,
        avatar: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
