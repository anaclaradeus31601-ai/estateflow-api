import { ConflictException } from '@nestjs/common';

export class CpfCnpjAlreadyExistsException extends ConflictException {
  constructor() {
    super('CPF/CNPJ já cadastrado');
  }
}
