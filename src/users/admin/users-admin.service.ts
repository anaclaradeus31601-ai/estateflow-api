import { Injectable } from '@nestjs/common';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailAlreadyExistsException } from 'src/common/exceptions';

@Injectable()
export class UsersAdminService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: AdminCreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
  }

  async update(id: string, updateUserDto: AdminUpdateUserDto) {
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

    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
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
