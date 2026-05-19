import { NotFoundException } from '@nestjs/common';

export class EntityNotFoundException extends NotFoundException {
  constructor(entity: string, identifier?: string) {
    const message = identifier
      ? `${entity} não encontrado(a): ${identifier}`
      : `${entity} não encontrado(a)`;
    super(message);
  }
}
