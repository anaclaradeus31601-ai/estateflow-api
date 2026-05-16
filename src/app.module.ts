import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OwnerModule } from './owner/owner.module';
import { PropertyModule } from './property/property.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, OwnerModule, PropertyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
