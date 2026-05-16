import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prisma: PrismaService) { }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email }
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const token = this.jwtService.sign({
            name: user.name,
            email: user.email,
            role: user.role,
            sub: user.id
        },
            { algorithm: 'HS256', expiresIn: '1h' }
        );
        return { access_token: token };
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email }
        });
        if (existingUser) {
            throw new UnauthorizedException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        try {
            const user = await this.prisma.user.create({
                data: {
                    name: registerDto.name,
                    email: registerDto.email,
                    password: hashedPassword,
                    role: 'CLIENT'
                }
            });
            const token = this.jwtService.sign({
                name: user.name,
                email: user.email,
                role: user.role,
                sub: user.id
            },
                { algorithm: 'HS256', expiresIn: '1h' }

            );
            return { access_token: token };

        } catch (error) {
            throw new UnauthorizedException('Error creating user');
        }

    }
}
