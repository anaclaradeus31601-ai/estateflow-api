import { HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface PrismaErrorMapping {
  status: HttpStatus;
  message: string;
}

const PRISMA_ERROR_MAP: Record<string, PrismaErrorMapping> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Registro duplicado: violação de unicidade',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Referência inválida: registro relacionado não existe',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'Registro não encontrado',
  },
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Relação inválida entre registros',
  },
  P2016: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Consulta inválida',
  },
};

function getUniqueFieldMessage(meta: PrismaClientKnownRequestError['meta']): string {
  const target = meta?.target;
  if (Array.isArray(target) && target.length > 0) {
    return `Registro duplicado: ${target.join(', ')} já existe`;
  }
  return PRISMA_ERROR_MAP.P2002.message;
}

export function mapPrismaError(
  exception: PrismaClientKnownRequestError,
): PrismaErrorMapping {
  if (exception.code === 'P2002') {
    return {
      status: HttpStatus.CONFLICT,
      message: getUniqueFieldMessage(exception.meta),
    };
  }

  return (
    PRISMA_ERROR_MAP[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno ao processar operação no banco de dados',
    }
  );
}
