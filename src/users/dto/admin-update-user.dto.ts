import { PartialType } from '@nestjs/swagger';
import { AdminCreateUserDto } from './admin-create-user.dto';

export class AdminUpdateUserDto extends PartialType(AdminCreateUserDto) {}
