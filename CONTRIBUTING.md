# Guia de Contribuição

## Padrões de Branches

```
main              - Produção
develop           - Desenvolvimento
feature/[nome]    - Novas funcionalidades (ex: feature/viagem-filtro)
bugfix/[issue]    - Correções (ex: bugfix/auth-token)
hotfix/[versao]   - Correções críticas
security/[nome]   - Issues de segurança
```

## Commits Semânticos

Utilize o padrão Conventional Commits:

```
feat: adicionar filtro de viagens por data
fix: corrigir validação de CEP
docs: atualizar README com deploy Render
style: formatar entidades com Prettier
refactor: otimizar query de veículos
test: adicionar testes E2E para auth
chore: atualizar dependências
```

## Regras Estritas

### 1. Proibição de DELETE em Usuários
**NUNCA** implemente DELETE direto na entidade `Usuario`. Use soft delete ou anonymização para manter integridade referencial.

### 2. Validações Obrigatórias
- DTOs com validação `@nestjs/class-validator`
- Tratamento de exceções globais
- Logs estruturados com timestamps

### 3. Code Review
- Pull Requests devem ter ≥ 80% coverage
- Mínimo 1 aprovação de desenvolvedor sênior
- Testes E2E para novos endpoints

## Fluxo de Contribuição

1. Fork o projeto
2. Crie branch `feature/nome-da-funcionalidade`
3. Commit com mensagens semânticas
4. Push e abra Pull Request para `develop`
5. Aguarde code review e testes

## Ferramentas Obrigatórias

```bash
npm install -g @commitlint/cli husky
npm run lint
npm run test:e2e
```

