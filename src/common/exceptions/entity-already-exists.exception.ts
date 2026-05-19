import { ConflictException } from '@nestjs/common';

export class EntityAlreadyExistsException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
