# 🔐 Template: Login & Registro com JWT (NestJS)

> **Propósito:** este serve como um modelo/template para projetos em NestJS que implementam um sistema de autenticação (registro, login, proteção de rotas) com segurança por JWT e armazenamento em MySQL usando Sequelize.

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

Acessivel em:
``
http://localhost:3000/api/docs
``

---

## 🤝 Contribuindo

1. Abra uma issue descrevendo a alteração
2. Faça um branch: `git checkout -b feat/<minha-feature>`
3. Commit e PR com descrições claras

---

## 📜 Licença
Escolha a licença apropriada (MIT por padrão). Ajuste `License.md` conforme necessário.

