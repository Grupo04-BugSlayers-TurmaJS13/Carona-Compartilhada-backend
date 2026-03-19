# 🧪 Documentação de Testes — Carona Compartilhada API

Essa documentação foi elaborada para descrever todos os testes realizados via Insomnia na API do projeto Carona Compartilhada. Os testes estão organizados por entidade e seguem a ordem recomendada para garantir que os dados necessários já existam no banco antes de cada etapa.

> Antes de começar, rode a aplicação com `npm run start:dev` e confirme que ela está rodando em `http://localhost:4000`.

---

## Sumário

- [Usuário](#usuario)
- [Veículo](#veiculo)
- [Viagem](#viagem)

---

## Usuario

### POST Cadastrar Usuário

Cria um novo usuário no sistema. A senha é criptografada automaticamente antes de ser salva.

**Rota:** `POST /usuarios/cadastrar`

**Body:**
```json
{
	"nome": "Administrador",
	"usuario": "admin@email.com",
	"senha": "12345678",
	"foto": "https://imgur.com/a/49sJys3",
	"tipo": "usuario"
}
```

**Saída esperada:** `201 Created` com os dados do usuário cadastrado e a senha já criptografada.

---

### POST Logar

Autentica o usuário e retorna o token JWT que será usado em todas as outras requisições.

**Rota:** `POST /usuarios/logar`

**Body:**
```json
{
  "usuario": "admin@email.com",
  "senha": "12345678"
}
```

**Saída esperada:** `200 OK` com o token JWT no campo `token`. Copie esse token e adicione em **Auth > Bearer Token** em todas as próximas requisições.

---

### GET Listar Todos os Usuários

Retorna todos os usuários cadastrados no sistema, incluindo as viagens relacionadas a cada um.

**Rota:** `GET /usuarios/all`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com um array contendo todos os usuários e o array `viagens` dentro de cada um.

---

### GET Buscar Usuário por ID

Retorna um usuário específico pelo seu ID, junto com as viagens vinculadas a ele.

**Rota:** `GET /usuarios/:id`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com os dados do usuário e suas viagens. Se o ID não existir, retorna `404 Not Found` com a mensagem `Usuário não encontrado!`.

---

### PUT Atualizar Usuário

Atualiza os dados de um usuário já cadastrado. A senha é criptografada novamente ao salvar.

**Rota:** `PUT /usuarios/atualizar`

**Auth:** Bearer Token

**Body:**
```json
{
  "id": 1,
  "nome": "Roger Montenegro Editada",
  "usuario": "admin@email.com",
  "senha": "novaSenha123",
  "foto": "https://imgur.com/a/49sJys3",
  "tipo": "admin"
}
```

**Saída esperada:** `200 OK` com os dados atualizados. Se o e-mail informado já pertencer a outro usuário, retorna `400 Bad Request` com a mensagem `Este e-mail já está sendo usado por outro usuário!`.

---

## Veiculo

> Para testar os endpoints de veículo, o usuário precisa estar logado e o token deve estar configurado no Insomnia.

### POST Cadastrar Veículo

Cadastra um novo veículo no sistema. A placa precisa ser única.

**Rota:** `POST /veiculos`

**Auth:** Bearer Token

**Body:**
```json
{
  "motorista": "Roger Montenegro",
  "marca": "Honda",
  "modelo": "Civic",
  "cor_veiculo": "Prata",
  "placa": "ABC-1234",
  "capacidade": 4,
  "tipo": "carro",
  "foto": "https://imgur.com/a/49sJys3"
}
```

**Saída esperada:** `201 Created` com os dados do veículo cadastrado. Se a placa já estiver cadastrada, retorna `400 Bad Request` com a mensagem `Já existe um veículo cadastrado com essa placa!`.

---

### GET Listar Todos os Veículos

Retorna todos os veículos cadastrados no sistema.

**Rota:** `GET /veiculos`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com um array de todos os veículos.

---

### GET Listar Veículo por ID

Retorna um veículo específico pelo seu ID.

**Rota:** `GET /veiculos/:id`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com os dados do veículo. Se o ID não existir, retorna `404 Not Found` com a mensagem `Veículo não encontrado!`.

---

### GET Buscar por Nome do Motorista

Busca veículos pelo nome do motorista. A busca é parcial e não diferencia maiúsculas de minúsculas.

**Rota:** `GET /veiculos/motorista/:motorista`

**Auth:** Bearer Token

**Exemplo:** `GET /veiculos/motorista/Gabriela`

**Saída esperada:** `200 OK` com um array de veículos cujo campo `motorista` contém o termo buscado.

---

### PUT Atualizar Veículo

Atualiza os dados de um veículo já cadastrado. A placa não pode ser igual à de outro veículo.

**Rota:** `PUT /veiculos`

**Auth:** Bearer Token

**Body:**
```json
{
	"id": 1,
  "motorista": "Roger Montenegro Editado",
  "marca": "Honda",
  "modelo": "Civic",
  "cor_veiculo": "Prata",
  "placa": "ABC-1234",
  "capacidade": 4,
  "tipo": "carro",
  "foto": "https://imgur.com/a/49sJys3"
}
```

**Saída esperada:** `200 OK` com os dados atualizados. Se a placa informada já pertencer a outro veículo, retorna `400 Bad Request` com a mensagem `Já existe outro veículo cadastrado com essa placa!`.

---

### DELETE Deletar Veículo

Remove um veículo do sistema pelo seu ID.

**Rota:** `DELETE /veiculos/:id`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com o resultado da exclusão. Se o ID não existir, retorna `404 Not Found` com a mensagem `Veículo não encontrado!`.

---

## Viagem

> Para testar os endpoints de viagem, é necessário ter pelo menos um usuário e um veículo já cadastrados no banco.

### POST Criar Viagem sem Agendamento

Cria uma viagem imediata. O sistema calcula automaticamente o tempo estimado e o valor com base na distância informada.

**Rota:** `POST /viagens`

**Auth:** Bearer Token

**Body:**
```json
{
  "origem": "São Paulo, SP",
  "destino": "Rio de Janeiro, RJ",
  "embarque": "Terminal Tietê",
  "data_saida": "2024-05-20T14:30:00.000Z",
  "preco": 50.00,
  "distancia": 435.5,
  "vagas_disponiveis": 3,
  "pagamento": "Dinheiro",
  "usuario": {
    "id": 1
  },
  "veiculo": {
    "id": 1
  },
  "status": "Aceita"
}
```

**Saída esperada:** `201 Created` com `tempoViagem` e `valor` preenchidos automaticamente. Como por exemplo: Para 10 km, o tempo estimado é 12 minutos e o valor é R$ 12,40.

---

### POST Criar Viagem com Agendamento

Cria uma viagem agendada para uma data e hora específica. O campo `dataAgendamento` é obrigatório quando `agendamento` for `true`.

**Rota:** `POST /viagens`

**Auth:** Bearer Token

**Body:**
```json
{
	"origem": "São Paulo, SP",
	"destino": "Rio de Janeiro, RJ",
	"embarque": "Terminal Tietê",
	"data_saida": "2024-05-20T14:30:00.000Z",
	"preco": 540.00,
	"distancia": 435.5,
	"vagas_disponiveis": 3,
	"dataAgendamento": "2026-03-20T08:00:00",
	"pagamento": "Dinheiro",
	"usuario": {
		"id": 1
	},
	"veiculo": {
		"id": 1
	},
	"status": "Aceita"
}
```

**Saída esperada:** `201 Created` com `dataAgendamento` salva e os campos `tempoViagem` e `valor` calculados. Se `agendamento` for `true` e `dataAgendamento` não for enviada, retorna `400 Bad Request` com a mensagem `dataAgendamento é obrigatória quando agendamento for verdadeiro!`.

---

### GET Listar Todas as Viagens

Retorna todas as viagens cadastradas, incluindo os dados do usuário e do veículo vinculados a cada uma.

**Rota:** `GET /viagens`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com um array de viagens, cada uma contendo os objetos `usuario` e `veiculo` completos.

---

### GET Buscar Viagem por ID

Retorna uma viagem específica pelo seu ID, com os dados de usuário e veículo relacionados.

**Rota:** `GET /viagens/:id`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com os dados completos da viagem. Se o ID não existir, retorna `404 Not Found` com a mensagem `Viagem não encontrada!`.

---

### GET Buscar Viagem por Destino

Busca viagens pelo destino informado. A busca é parcial e não diferencia maiúsculas de minúsculas.

**Rota:** `GET /viagens/destino/:destino`

**Auth:** Bearer Token

**Exemplo:** `GET /viagens/destino/Centro`

**Saída esperada:** `200 OK` com um array de viagens cujo campo `destino` contém o termo buscado. Se nenhuma viagem for encontrada, retorna `404 Not Found` com a mensagem `Nenhuma viagem encontrada para esse destino!`.

---

### PUT Atualizar Viagem

Atualiza os dados de uma viagem existente. O tempo e o valor são recalculados automaticamente.

**Rota:** `PUT /viagens`

**Auth:** Bearer Token

**Body:**
```json
{
		"id": "2",
		"embarque": "Terminal Tietê saida A",
		"destino": "Rio de Janeiro, RJ",
		"distancia": "435.50",
		"tempoViagem": 523,
		"status": "Aceita",
		"agendamento": false,
		"dataAgendamento": "2026-03-19",
		"dataEncerramento": null,
		"pagamento": "Dinheiro",
		"valor": "540.10",
		"veiculo": {
			"id": 1,
			"motorista": "Roger Montenegro Editado",
			"foto": "https://imgur.com/a/49sJys3",
			"tipo": "CARRO",
			"modelo": "Civic",
			"marca": "Honda",
			"cor_veiculo": "Prata",
			"placa": "ABC-1234"
		},
		"usuario": {
			"id": 1,
			"nome": "Administrador Editado",
			"usuario": "admin@email.com",
			"senha": "$2b$10$t2wF/q76KlvPYJQ3SZO/x.tosmALN7AlXkdVBRV60xhJTvR1LvyrS",
			"foto": "https://imgur.com/a/49sJys3"
		}
	}
```

**Saída esperada:** `200 OK` com os dados atualizados e `tempoViagem` e `valor` recalculados para a nova distância. Se o ID não existir, retorna `404 Not Found`.

---

### PUT Encerrar Viagem

Encerra uma viagem em andamento, marcando o status como `Concluida`. Se o tempo real da viagem ultrapassar o estimado, uma taxa extra de R$ 0,50 por minuto adicional é cobrada automaticamente.

**Rota:** `PUT /viagens/encerrar/:id`

**Auth:** Bearer Token

**Body:**
```json
{
	"id": "1",
	"embarque": "Terminal Tietê",
	"destino": "Rio de Janeiro, RJ",
	"distancia": "435.50",
	"pagamento": "Dinheiro",
	"valor": "540.10",
  "dataEncerramento": "2026-03-19T10:30:00",
	"status": "Concluida"
}

```

**Saída esperada:** `200 OK` com `status` igual a `Concluida` e o `valor` final atualizado com a taxa extra se o tempo real tiver sido maior que o estimado. Se a viagem já estiver encerrada, retorna `400 Bad Request` com a mensagem `Esta viagem já foi encerrada!`.

---

### DELETE Deletar Viagem

Remove uma viagem do sistema pelo seu ID.

**Rota:** `DELETE /viagens/:id`

**Auth:** Bearer Token

**Saída esperada:** `200 OK` com o resultado da exclusão. Se o ID não existir, retorna `404 Not Found` com a mensagem `Viagem não encontrada!`.