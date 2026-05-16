import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}
  async canActivate(
    context: ExecutionContext,
    //exec http ou kafka, rabbit...
  ): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];
    //Bearer token
    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      const payload = this.jwtService.verify<{ 
        name: string, 
        email: string,
        role: UserRole,
        sub: string
      }>(token, { 
        algorithms: ['HS256'] 
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });
      if (!user) {
        throw new UnauthorizedException('User not found')
      }
      request.user = user; //colocar o usuario na request para usar depois nos controllers
      return true;
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Inavalid token', { cause: e })
    }



    return true;
  }
}
