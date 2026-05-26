import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailAlreadyExistsException } from 'src/common/exceptions';
import { PublicRegisterUserDto } from './dto/public-register-user.dto';

@Injectable()
export class UsersPublicService {
  constructor(private prisma: PrismaService) {}

  async register(publicRegisterUserDto: PublicRegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: publicRegisterUserDto.email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    return this.prisma.user.create({
      data: {
        name: publicRegisterUserDto.name,
        email: publicRegisterUserDto.email,
        phone: publicRegisterUserDto.phone || null,
        password: bcrypt.hashSync(publicRegisterUserDto.password, 10),
        role: UserRole.CLIENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
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
        phone: true,
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
        phone: true,
        role: true,
        avatar: true,
      },
    });
  }
}
