## Objetivo do projeto `backEnd-piloto`

Este projeto é um **back-end Node.js simples**, criado como piloto para simular o fluxo de pagamentos de um PDV (ponto de venda), expondo uma API REST com:

- **Consulta de formas de pagamento disponíveis (mockadas)**.
- **Registro de transações de pagamento**, gravando cada transação em um arquivo `.json` individual para rastreio.

### Principais funcionalidades

- **GET `/api/payments`**
  - Retorna uma lista fixa (mock) das formas de pagamento disponíveis.
  - Exemplo de retorno:
    - `Cartão de Crédito`
    - `Cartão de Débito`
    - `Pix`

- **POST `/api/transactions`**
  - Recebe os dados de uma transação de pagamento (forma de pagamento, valor, dados do meio de pagamento, etc.).
  - Gera/garante identificadores como:
    - `idTransaction` (UUID).
    - `idOrder` (string única baseada em data/hora).
  - **Grava a transação em um arquivo JSON individual**, identado, na pasta `logs`, com nome no padrão:
    - `transaction-<idTransaction>.json`

### Documentação e teste via Swagger

- A API expõe uma interface de documentação interativa via **Swagger UI**.
- Endpoints:
  - **Swagger UI (página principal)**: `http://localhost:3030/` (redireciona para `/api-docs`).
  - **Documentação Swagger**: `http://localhost:3030/api-docs`.
- No Swagger é possível:
  - Visualizar a descrição das rotas e modelos de dados.
  - Testar as chamadas `GET /api/payments` e `POST /api/transactions` diretamente pelo navegador.

### Configuração de porta (.env)

- O projeto utiliza a biblioteca `dotenv` para ler variáveis de ambiente.
- A porta padrão é definida via arquivo `.env` na raiz do projeto:

  ```env
  PORT=3030
  ```

- Caso a variável `PORT` não esteja definida, o servidor também assumirá a porta `3030` por padrão.

### Objetivo geral

O objetivo deste projeto é servir como **piloto/back-end de referência** para:

- Simular integrações de pagamento em um ambiente de PDV.
- Disponibilizar uma API simples e clara para outros componentes (por exemplo, um app Android) consumirem:
  - As formas de pagamento disponíveis.
  - O registro e rastreamento de transações.
- Demonstrar:
  - Uso de Node.js + Express.
  - Organização simples de rotas.
  - Gravação de dados em arquivos (`logs`) para auditoria.
  - Documentação de API com Swagger/OpenAPI.


