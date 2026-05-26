import { BadRequestException } from '@nestjs/common';

export class InvalidPriceRangeException extends BadRequestException {
  constructor() {
    super(
      'Faixa de preço inválida: o valor mínimo deve ser menor que o máximo',
    );
  }
}
