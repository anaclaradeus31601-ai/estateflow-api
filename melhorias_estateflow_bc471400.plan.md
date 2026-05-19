---
name: Melhorias EstateFlow
overview: Melhorias priorizadas por impacto para a API EstateFlow, cobrindo segurança, confiabilidade, DX (Swagger/env) e consistência de código — sem mudar o que já está funcionando.
todos:
  - id: seed-env-guard
    content: Condicionar SeedService (NODE_ENV ou RUN_SEED) e criar .env.example + ConfigModule com validação JWT_SECRET
    status: pending
  - id: common-filters-passport
    content: Registrar HttpExceptionFilter + PrismaExceptionFilter via APP_FILTER; PassportModule no AuthModule
    status: pending
isProject: false
---

# Melhorias recomendadas — EstateFlow

Com login e rotas admin ok, o próximo passo é endurecer o que já existe e reduzir armadilhas de dev (Swagger, seed, env). Ordem sugerida: **segurança → confiabilidade → DX → polish**.

```mermaid
flowchart LR
  subgraph now [Estado atual]
    Login[POST /auth/login]
    Guards[JwtAuthGuard + RolesGuard]
    Swagger[/docs]
  end
  subgraph gaps [Lacunas]
    PropertyAdmin[admin/property sem guards]
    Seed[Seed apaga DB todo start]
    Env[JWT sem validacao no boot]
    ContractUpdate[update sem async/404]
  end
  Login --> Guards
  Guards -.-> PropertyAdmin
```

---

## 1. Alta prioridade (impacto imediato)

### 1.1 Proteger `admin/property` como os outros admins

[`src/property/admin/admin-property.controller.ts`](src/property/admin/admin-property.controller.ts) é o único controller `admin/*` **sem** `@UseGuards(JwtAuthGuard, RolesGuard)` e `@Roles(UserRole.ADMIN)`. Hoje qualquer cliente pode criar/editar/remover imóveis.

**Ação:** espelhar [`src/owner/admin/owner-admin.controller.ts`](src/owner/admin/owner-admin.controller.ts):

- `@UseGuards(JwtAuthGuard, RolesGuard)` na classe
- `@Roles(UserRole.ADMIN)` em POST/PATCH/DELETE
- `@ApiBearerAuth()` no Swagger

### 1.2 Seed só em desenvolvimento (ou sob flag)

[`src/seed/seed.service.ts`](src/seed/seed.service.ts) roda em `onModuleInit` via [`src/app.module.ts`](src/app.module.ts) e **apaga todos os dados** a cada `start:dev`. Isso é ótimo para demo local, perigoso em staging/prod.

**Ação (escolha simples):**

```typescript
// seed.service.ts — início de onModuleInit
if (process.env.NODE_ENV === 'production') return;
// ou: if (process.env.RUN_SEED !== 'true') return;
```

Alternativa melhor a médio prazo: mover seed para `prisma/seed.ts` + script `npx prisma db seed`, removendo `SeedService` do `AppModule` em produção.

### 1.3 Validar variáveis de ambiente no boot

Não há `.env.example` no repo e não há `ConfigModule`. Se `JWT_SECRET` faltar, o login falha de forma opaca.

**Ação:**

- Adicionar `@nestjs/config` com `ConfigModule.forRoot({ isGlobal: true })` em [`src/app.module.ts`](src/app.module.ts)
- Criar `.env.example` com `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `RUN_SEED` (opcional)
- Em [`src/auth/auth.module.ts`](src/auth/auth.module.ts), usar `ConfigService` para `JwtModule.registerAsync` e falhar no boot se secret estiver vazio

### 1.4 Alinhar `ContractAdminService.update` com o resto

[`src/contract/admin/contract-admin.service.ts`](src/contract/admin/contract-admin.service.ts) — `update` não é `async`, não verifica existência e devolve erro Prisma cru em ID inválido (diferente de payment/amenity).

**Ação:** mesmo padrão de [`src/payment/admin/payment-admin.service.ts`](src/payment/admin/payment-admin.service.ts):

```typescript
async update(id: string, dto: UpdateContractDto) {
  const exists = await this.prisma.contract.findUnique({ where: { id } });
  if (!exists) throw new EntityNotFoundException('Contrato', id);
  return this.prisma.contract.update({ ... });
}
```

---

## 2. Média prioridade (DX e manutenção)

### 2.1 Exemplos do Swagger que batem com o seed

[`src/auth/dto/login.dto.ts`](src/auth/dto/login.dto.ts) usa `user@example.com` / `senha123`, mas o seed cria `admin@example.com` / `admin123`. Isso foi causa frequente de 401 no Swagger.

**Ação:** trocar `@ApiProperty` examples para as credenciais reais do seed (ou documentar no `DocumentBuilder` uma nota “credenciais de dev”).

### 2.2 Auth module mais robusto

[`src/auth/auth.module.ts`](src/auth/auth.module.ts) registra só `JwtModule`; falta `PassportModule.register({ defaultStrategy: 'jwt' })` (recomendado pelo Nest).

**Ação:** adicionar PassportModule e `exports: [JwtModule]` se outros módulos precisarem do mesmo secret/expiração.

### 2.3 Filtros globais via `CommonModule`

Hoje só [`UnknownExceptionFilter`](src/main.ts) é global; `HttpExceptionFilter` e `PrismaExceptionFilter` existem em [`src/common/filters`](src/common/filters) mas podem não estar registrados.

**Ação:** registrar os três via `APP_FILTER` em [`src/common/common.module.ts`](src/common/common.module.ts) — respostas 404/409/400 consistentes em toda a API.

### 2.4 `RegisterDto` sem endpoint

Existe [`src/auth/dto/register.dto.ts`](src/auth/dto/register.dto.ts) mas não há `POST /auth/register`. Ou expor rota (pública ou admin-only) ou remover DTO morto para não confundir.

---

## 3. Baixa prioridade (quando quiser polir)

| Item | Por quê |
|------|---------|
| Testes e2e (`test/app.e2e-spec.ts`) | Login + uma rota admin com token — evita regressão |
| Prefixo global `/api` | Separação clara se houver frontend estático |
| Paginação em `findAll` públicos | property/contract/owner listam tudo sem `take/skip` |
| Rate limit no login | Proteção básica contra brute force (`@nestjs/throttler`) |
| Mensagens de login | Manter genérico (“Credenciais inválidas”) — não revelar se email existe |

---

## O que **não** mudaria agora

- Swagger nos controllers/DTOs — já está bom
- Pasta `src/common` com exceptions — manter e só garantir filtros registrados
- Fluxo Bearer no Swagger — já funciona; só corrigir exemplos do login

---

## Ordem sugerida de implementação (1 PR ou commits pequenos)

1. Guards em `admin/property` (~15 min, maior risco de segurança)
2. Seed condicional + `.env.example` + `ConfigModule` (~30 min)
3. `ContractAdminService.update` async + 404 (~10 min)
4. LoginDto examples + filtros globais + PassportModule (~20 min)
5. Register endpoint ou remoção do DTO (decisão de produto)

Nenhuma dessas mudanças quebra o fluxo que você validou (login → Authorize → admin), desde que o seed continue disponível em dev com as mesmas credenciais.
