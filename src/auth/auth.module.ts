import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global:true,
      secret: 'your-secret-key',
      signOptions: { expiresIn: '4h', algorithm: 'HS256' },
  }),
],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
