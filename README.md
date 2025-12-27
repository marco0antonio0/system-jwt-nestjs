# 🔐 Template: Login & Registro com JWT (NestJS)

> **Propósito:** este README serve como um modelo/template para projetos em NestJS que implementam um sistema de autenticação (registro, login, proteção de rotas) com segurança por JWT e armazenamento em MySQL usando Sequelize.

---

## ✅ Visão geral

- Stack: **NestJS**, **TypeScript**, **MySQL** + **Sequelize**, **JWT**, **bcrypt**
- Objetivo: oferecer um template claro e seguro para autenticação de usuários (registro, login, rotas protegidas) e boas práticas de produção.

---

## 🔧 Recursos principais

- Registro de usuário (hash de senha com bcrypt)
- Login com emissão de JWT (configurável via `JWT_SECRET`)
- Rotas protegidas com `JwtAuthGuard` + `JwtStrategy`
- Armazenamento em **MySQL** via **sequelize** (`sequelize-typescript`)
- Estrutura pronta para adicionar refresh tokens, políticas de senha e rate limiting

---

## 📋 Requisitos

- Node.js (LTS recomendado)
- MySQL 5.7+ ou MariaDB compatível
- npm ou bun

---

## 🚀 Quick start

1. Clone o projeto

```bash
git clone https://github.com/marco0antonio0/system-jwt-nestjs
cd system-jwt-nestjs
```

2. Copie o `.env.example` e ajuste variáveis

```bash
cp .env.example .env
# edite .env conforme seu ambiente
```

Variáveis importantes no `.env` (exemplo):

```
# Server
PORT=3000

# JWT
JWT_SECRET=uma_chave_secreta_bem_grande

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=secret
DB_DATABASE=makeapi_dev
```

3. Instale dependências e rode em modo dev

```bash
npm install
npm run start:dev
```

> ⚠️ Por padrão o template pode usar `synchronize: true` (Sequelize) para facilitar o desenvolvimento — em produção prefira usar migrations.

---

## 🗄️ Banco de dados

- O projeto usa **Sequelize** com suporte a `sequelize-typescript`.
- Para produção, integre `sequelize-cli` ou `umzug` para **migrations** (criar, migrar e versionar schemas).

Sugestão de fluxo (produção):

1. Gerar migration
2. Rodar migrations no deploy
3. Desativar `synchronize: true` no `SequelizeModule` e confiar nas migrations

---

## 🔐 Autenticação — Endpoints principais

API base: `/auth`

| Método | Rota | Descrição |
|---|---:|---|
| POST | `/auth/register` | Registrar usuário (username, email, password). Senha será hasheada antes de salvar. Retorna token.
| POST | `/auth/login` | Login com `email` + `password`. Retorna `access_token` (JWT).
| GET  | `/auth/me` | Rotas protegidas (autenticação necessária). Retorna `id`, `email`, `role` do usuário autenticado.
| POST | `/auth/change-role` | Endpoint protegido para alteração de roles (apenas usuários com autorização apropriada).

### Exemplo: Registrar

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","email":"joao@ex.com","password":"Minh@Senha123"}'
```

### Exemplo: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@ex.com","password":"Minh@Senha123"}'
```

Resposta de sucesso:

```json
{
  "access_token": "eyJhbGciOiJI...",
  "status": 200,
  "id": "1"
}
```

---

## 🧩 Implementação técnica (resumo)

- **Hash de senhas:** usamos `bcrypt` (salt rounds = 10) — senhas são hasheadas ao criar ou atualizar.
- **Login:** `AuthService` usa `bcrypt.compare()` para validar senha fornecida contra hash armazenado.
- **JWT:** `JwtService` do NestJS assina o token com `JWT_SECRET`. A `JwtStrategy` valida o token e popula `request.user`.
- **Guards:** `JwtAuthGuard` (estende `AuthGuard('jwt')`) protege rotas com `@UseGuards(JwtAuthGuard)`.

> Nota: o código do projeto pode emitir tokens com tempos de expiração diferentes por role (ex.: role 3 recebe token de longa duração) — avalie cuidado com tokens long-lived.

---

## 🔒 Boas práticas de segurança

- Use HTTPS em produção
- Mantenha `JWT_SECRET` em segredo (cofre de segredos / variáveis de ambiente protegidas)
- Adote **refresh tokens** em vez de elevar a duração do access token para long-lived
- Rate limit para endpoints sensíveis (login, register, forgot-password)
- Políticas de senha (min length, força) e proteção contra brute-force
- Logging e monitoramento (falhas de login / tentativas suspeitas)


### 📚 Swagger (Documentação API)

O Swagger gera **documentação interativa** das APIs e facilita testes manuais. Abaixo tem um exemplo de como habilitar e proteger o Swagger no seu projeto NestJS.

1) Instale dependências (se ainda não estiverem presentes):

```bash
npm install @nestjs/swagger swagger-ui-express --save
```

2) Exemplo de configuração em `src/main.ts` (recomendo ativar somente em dev ou via variável de ambiente):

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const enableSwagger = configService.get('SWAGGER') === 'true' || process.env.NODE_ENV !== 'production';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Make API')
      .setDescription('API de autenticação com JWT')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearerAuth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    // mounted at /api/docs to follow API prefix conventions
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

3) Como documentar endpoints protegidos:

- Adicione `@ApiBearerAuth()` no controller ou método.
- Use `@UseGuards(JwtAuthGuard)` para exigir autenticação.
- Exemplos de decorators já usados no projeto: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBody`.

4) Acessando a documentação

- UI interativa: `GET /api/docs` (após habilitar)
- JSON do OpenAPI: `GET /api/docs-json` (ou `/api-json` dependendo da sua configuração)

5) Segurança da documentação

- Não exponha o Swagger em produção sem proteção (basic auth, firewall ou variável de controle). Uma prática comum é ativá-lo apenas em `NODE_ENV !== 'production'` ou por `SWAGGER=true`.
- Para produção, considere adicionar autenticação básica no middleware para `/docs` ou removê-lo completamente.

---

---

## 🐳 Docker (opcional)

- Para deploy, crie um `Dockerfile` e `docker-compose.yml` que inclua o serviço MySQL e a app Node. Ex.:

```yaml
services:
  app:
    build: .
    env_file: .env
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
```

---

## ✅ Checklist para produção

- [ ] Migrations configuradas e testadas
- [ ] Tokens com tempo adequado + estratégia de refresh
- [ ] HTTPS + variáveis de ambiente seguras
- [ ] Rate limiting + proteção contra brute force
- [ ] Monitoring, backups e logs configurados

---

## 🤝 Contribuindo

1. Abra uma issue descrevendo a alteração
2. Faça um branch: `git checkout -b feat/<minha-feature>`
3. Commit e PR com descrições claras

---

## 📜 Licença
Escolha a licença apropriada (MIT por padrão). Ajuste `License.md` conforme necessário.

---

Se quiser, adapto este README para incluir instruções de migrations (ex.: `sequelize-cli`) e exemplos reais de `docker-compose` para seu ambiente — quer que eu adicione essas seções agora? ✨
# 🚀 Make Api — CMS leve para endpoints e dados

<div style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
  <img src="https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white">
  <img src="https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=ffffff">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white">
</div>

**Make Api** é um CMS **simples e direto** para criar endpoints REST e gerenciar conteúdo de sites e apps, com foco em velocidade e praticidade.

---

## ⚙️ Requisitos
- Node.js LTS (18+ recomendado)
- npm

---

## 🚚 Instalação e execução
```bash
# instalar dependências
npm install --legacy-peer-dependency

# executar em desenvolvimento
npm run dev
```

Crie um `.env` (ou use `.env.example`), por exemplo:
```env
FIREBASE_API_KEY= 
FIREBASE_AUTH_DOMAIN= 
FIREBASE_PROJECT_ID= 
FIREBASE_APP_ID= 
FIREBASE_MESSAGING_SENDER_ID= 
FIREBASE_STORAGE_BUCKET= 
JWT_SECRET= 
```

---

## 📁 Estrutura mínima sugerida
```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 dist/ 🚫 (auto-hidden)
├── 📁 netlify/
│   └── 📁 functions/
│       └── 📄 nest.ts
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 src/
│   ├── 📁 auth/
│   │   ├── 📁 decorators/
│   │   │   └── 📄 user.decorator.ts
│   │   ├── 📁 dtos/
│   │   │   ├── 📄 change-password.dto.ts
│   │   │   ├── 📄 forgot-password.dto.ts
│   │   │   ├── 📄 login.dto.ts
│   │   │   ├── 📄 register-confirm.dto.ts
│   │   │   ├── 📄 register-request.dto.ts
│   │   │   ├── 📄 register.dto.ts
│   │   │   └── 📄 reset-password.dto.ts
│   │   ├── 📄 auth.controller.ts
│   │   ├── 📄 auth.module.ts
│   │   ├── 📄 auth.repositories.ts
│   │   ├── 📄 auth.service.ts
│   │   ├── 📄 jwt-auth.guard.ts
│   │   └── 📄 jwt.strategy.ts
│   ├── 📁 endpoint/
│   │   ├── 📄 endpoint.controller.ts
│   │   ├── 📄 endpoint.module.ts
│   │   ├── 📄 endpoint.repository.ts
│   │   └── 📄 endpoint.service.ts
│   ├── 📁 firebase/
│   │   ├── 📄 firebase.module.ts
│   │   └── 📄 firebase.tokens.ts
│   ├── 📁 itens/
│   │   ├── 📄 itens.controller.ts
│   │   ├── 📄 itens.module.ts
│   │   ├── 📄 itens.repository.ts
│   │   └── 📄 itens.service.ts
│   ├── 📄 app.controller.ts
│   ├── 📄 app.module.ts
│   ├── 📄 app.service.ts
│   └── 📄 main.ts
├── 📁 test/
│   ├── 📄 app.e2e-spec.ts
│   └── 📄 jest-e2e.json
├── 🔒 .env 🚫 (auto-hidden)
├── 📄 .env.example
├── 📄 .eslintrc.js
├── 🚫 .gitignore
├── 📄 .prettierrc
├── 📜 License.md
├── 📖 README.md
├── 🔒 bun.lock 🚫 (auto-hidden)
├── 📄 nest-cli.json
├── ⚙️ netlify.toml
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 tsconfig.build.json 🚫 (auto-hidden)
└── 📄 tsconfig.json
```

---

## 🤝 Contribuição
1. Verifique e **assinale** uma *issue*.
2. Sincronize e crie sua *branch*:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/makeapi-<issue>   # ou fix/makeapi-<issue>
   ```
3. Commit objetivo:
   ```bash
   git commit -m "feat/makeapi-<issue>: resumo curto do que foi feito"
   ```
4. Envie e abra o PR:
   ```bash
   git push origin feat/makeapi-<issue>
   ```
   Revise o código e, estando OK, **autorize o merge**.

### Convenções rápidas
- Branches: `feat/makeapi-<issue>`, `fix/makeapi-<issue>`
- Commits: `tipo/escopo: mensagem` (ex.: `feat`, `fix`, `chore`, `docs`)

---

## 🧪 Scripts
```bash
npm run dev
npm run build
npm start
```

---

## 📜 Licença
MIT (ou ajuste conforme necessário).