import { SetMetadata } from '@nestjs/common';
//criando um decorator para colocar as roles dos usuarios nos controllers, e depois usar isso no guard para verificar se o usuario tem a role necessaria para acessar a rota
export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
