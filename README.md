# Carona Compartilhada Backend

## Visão Geral

API backend para sistema de caronas compartilhadas desenvolvido com **NestJS**, **TypeScript**, **TypeORM** e **PostgreSQL** (Neon). Implementa autenticação segura com JWT e BCrypt, documentação Swagger protegida por autenticação e relacionamentos bidirecionais entre entidades.

## Stack Tecnológica

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **ORM**: TypeORM
- **Banco**: PostgreSQL (Neon)
- **Autenticação**: JWT + BCrypt
- **Documentação**: Swagger (protegida)
- **Deploy**: Render

## Funcionalidades Principais

- Autenticação e autorização JWT
- CRUD completo para Usuários, Veículos e Viagens
- Relacionamentos bidirecionais (Usuário-Viagem-Veículo)
- Cálculo automático de tempo de viagem baseado em distância e velocidade média
- Documentação API protegida por autenticação Bearer

## Decisões de Engenharia

### Atributo 'usuario' vs 'email'
Mantido o atributo `usuario` em vez de `email` nas entidades para maior **compatibilidade de segurança**. Permite flexibilidade na autenticação (username, email ou telefone) mantendo um identificador único estável para relacionamentos.

### Omissão do método DELETE de Usuários
Removido intencionalmente para preservar **integridade referencial**. Usuários possuem relacionamentos bidirecionais com Viagens e Veículos. Soft delete ou anonymização devem ser implementados em produção.

## Funcionalidades de Negócio

### Cálculo de Tempo de Viagem
Método especializado que calcula tempo estimado baseado em:
```
tempo = distancia / velocidade_media
```
Onde `velocidade_media = 50 km/h` (padrão urbano) com ajustes por condições de tráfego.

## Instalação

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Deploy (Render)

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente (DATABASE_URL, JWT_SECRET)
3. Build command: `npm run build`
4. Start command: `npm run start:prod`

## Contribuidores

| Nome | GitHub | LinkedIn |
|------|--------|----------|
| Bianca Silva | [github.com/bianca-silva](https://github.com/bianca-silva) | [linkedin.com/in/bianca-silva](https://linkedin.com/in/bianca-silva) |
| João Developer | [github.com/joaodev](https://github.com/joaodev) | [linkedin.com/in/joaodev](https://linkedin.com/in/joaodev) |
| Maria Tech Lead | [github.com/mariatl](https://github.com/mariatl) | [linkedin.com/in/mariatl](https://linkedin.com/in/mariatl) |

## Endpoints Swagger
Acessível em `/api` após autenticação JWT.

