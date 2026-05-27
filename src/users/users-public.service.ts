import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailAlreadyExistsException } from 'src/common/exceptions';
import { PublicRegisterUserDto } from './dto/public-register-user.dto';
import { PublicUpdateProfileDto } from './dto/public-update-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UsersPublicService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersPublicService.name);
  }

  private getEmailVerificationSecret() {
    return process.env.JWT_EMAIL_VERIFICATION_SECRET ?? process.env.JWT_SECRET;
  }

  private getPasswordResetSecret() {
    return process.env.JWT_PASSWORD_RESET_SECRET ?? process.env.JWT_SECRET;
  }

  async register(publicRegisterUserDto: PublicRegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: publicRegisterUserDto.email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const user = await this.prisma.user.create({
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

    return {
      ...user,
      emailVerificationRequired: true,
    };
  }

  async requestEmailVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user || user.emailVerified) {
      return {
        message: 'Se o e-mail existir, enviaremos as instruções de verificação.',
      };
    }

    const verificationToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        purpose: 'email_verification',
      },
      {
        secret: this.getEmailVerificationSecret(),
        expiresIn: '24h',
      },
    );

    this.logger.info({
      category: 'business',
      event: 'email_verification_requested',
      userId: user.id,
      email: user.email,
      verificationToken:
        process.env.NODE_ENV === 'production' ? '[REDACTED]' : verificationToken,
    });

    return process.env.NODE_ENV === 'production'
      ? {
          message:
            'Se o e-mail existir, enviaremos as instruções de verificação.',
        }
      : {
        message: 'Se o e-mail existir, enviaremos as instruções de verificação.',
        verificationToken,
      };
  }

  async confirmEmailVerification(token: string) {
    const payload = this.jwtService.verify<{
      sub: string;
      email: string;
      purpose?: string;
    }>(token, {
      secret: this.getEmailVerificationSecret(),
    });

    if (payload.purpose !== 'email_verification') {
      throw new UnauthorizedException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { emailVerified: true },
    });

    this.logger.info({
      category: 'business',
      event: 'email_verified',
      userId: payload.sub,
      email: payload.email,
    });

    return { message: 'E-mail verificado com sucesso.' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return {
        message: 'Se o e-mail existir, enviaremos as instruções de recuperação.',
      };
    }

    const resetToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        purpose: 'password_reset',
      },
      {
        secret: this.getPasswordResetSecret(),
        expiresIn: '1h',
      },
    );

    this.logger.info({
      category: 'business',
      event: 'password_reset_requested',
      userId: user.id,
      email: user.email,
      resetToken: process.env.NODE_ENV === 'production' ? '[REDACTED]' : resetToken,
    });

    return process.env.NODE_ENV === 'production'
      ? {
          message:
            'Se o e-mail existir, enviaremos as instruções de recuperação.',
        }
      : {
          message:
            'Se o e-mail existir, enviaremos as instruções de recuperação.',
          resetToken,
        };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const payload = this.jwtService.verify<{
      sub: string;
      email: string;
      purpose?: string;
    }>(token, {
      secret: this.getPasswordResetSecret(),
    });

    if (payload.purpose !== 'password_reset') {
      throw new UnauthorizedException('Invalid password reset token');
    }

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        password: bcrypt.hashSync(newPassword, 10),
      },
    });

    await this.prisma.session.deleteMany({
      where: { userId: payload.sub },
    });

    this.logger.info({
      category: 'business',
      event: 'password_reset_confirmed',
      userId: payload.sub,
      email: payload.email,
    });

    return { message: 'Senha redefinida com sucesso.' };
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

  async update(id: string, updateUserDto: PublicUpdateProfileDto) {
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
