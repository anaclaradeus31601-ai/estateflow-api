import { Module } from '@nestjs/common';
import {
  HttpExceptionFilter,
  PrismaExceptionFilter,
  UnknownExceptionFilter,
} from './filters';

@Module({
  providers: [
    HttpExceptionFilter,
    PrismaExceptionFilter,
    UnknownExceptionFilter,
  ],
  exports: [
    HttpExceptionFilter,
    PrismaExceptionFilter,
    UnknownExceptionFilter,
  ],
})
export class CommonModule {}
