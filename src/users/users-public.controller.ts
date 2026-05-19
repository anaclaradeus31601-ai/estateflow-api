import { Controller, Get, Param, UseGuards, Patch, Body } from '@nestjs/common';
import { UsersPublicService } from './users-public.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersPublicController {
  constructor(private readonly usersService: UsersPublicService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.findOne(user.sub);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: AuthUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.sub, updateUserDto);
  }
}
