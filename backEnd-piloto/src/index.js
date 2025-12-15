require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());

// Definição básica do Swagger (OpenAPI 3.0)
const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Piloto - Pagamentos',
    version: '1.0.0',
    description:
      'API simples para consultar formas de pagamento e registrar transações de pagamento.',
  },
  servers: [
    {
      url: 'http://localhost:3030',
      description: 'Servidor local de desenvolvimento',
    },
  ],
  paths: {},
  components: {
    schemas: {
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Dinheiro' },
        },
      },
      TransactionRequest: {
        type: 'object',
        properties: {
          idTransaction: {
            type: 'string',
            description: 'UUID da transação gerado pelo cliente (opcional).',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          idOrder: {
            type: 'string',
            description:
              'Identificador único do pedido. Se não enviado, será gerado automaticamente.',
            example: '2025121514323012345678',
          },
          payment: {
            type: 'string',
            description:
              'Forma de pagamento selecionada. Ex.: Dinheiro, Cartão de Crédito, Pix.',
            example: 'Cartão de Crédito',
          },
          valuePay: {
            type: 'number',
            format: 'double',
            description: 'Valor monetário da transação.',
            example: 123.45,
          },
          transactionPay: {
            type: 'string',
            description:
              'Id da transação gerada pelo meio de pagamento (Stone, Cielo, PagBank, etc.).',
            example: 'STONE-ABC-123456',
          },
          brand: {
            type: 'string',
            description:
              'Bandeira do cartão para transações com cartão (Visa, Master, etc.).',
            example: 'Visa',
          },
          numberDocument: {
            type: 'string',
            description:
              'Número do cartão mascarado ou outro identificador do meio de pagamento.',
            example: '**** **** **** 1234',
          },
          autorizeNumber: {
            type: 'string',
            description:
              'Código de autorização/transação utilizado para cancelamento estorno.',
            example: '987654',
          },
          channel: {
            type: 'string',
            description:
              'Canal de origem da transação (ex.: API, PDV, APP, SITE).',
            example: 'PDV',
          },
          extraData: {
            type: 'object',
            additionalProperties: true,
            description:
              'Outros atributos úteis para rastrear a transação (ex.: idCaixa, idVendedor, etc.).',
            example: { idCaixa: '001', idVendedor: '123' },
          },
        },
        required: ['payment', 'valuePay'],
      },
      TransactionResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Transação registrada com sucesso.',
          },
          transaction: {
            allOf: [{ $ref: '#/components/schemas/TransactionRequest' }],
            properties: {
              idTransaction: {
                type: 'string',
                description:
                  'UUID da transação. Gerado pelo servidor se não enviado.',
              },
              idOrder: {
                type: 'string',
                description:
                  'Identificador único do pedido. Gerado pelo servidor se não enviado.',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Data/hora de criação no servidor.',
                example: '2025-12-15T14:32:30.123Z',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensagem de erro.' },
        },
      },
    },
  },
};

// Definição dos paths do Swagger
openapiSpec.paths['/api/payments'] = {
  get: {
    tags: ['Payments'],
    summary: 'Lista as formas de pagamento disponíveis',
    responses: {
      200: {
        description: 'Lista de formas de pagamento.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Payment' },
            },
          },
        },
      },
    },
  },
};

openapiSpec.paths['/api/transactions'] = {
  post: {
    tags: ['Transactions'],
    summary: 'Registra uma nova transação de pagamento',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/TransactionRequest' },
        },
      },
    },
    responses: {
      201: {
        description: 'Transação registrada com sucesso.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TransactionResponse' },
          },
        },
      },
      400: {
        description: 'Erro de validação dos dados enviados.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      500: {
        description: 'Erro interno ao registrar a transação.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
};

// Rota do Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
// Redireciona a raiz da API para a documentação Swagger
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Dados fixos de formas de pagamento
const payments = [
  { id: 5, name: 'Cartão de Crédito' },
  { id: 6, name: 'Cartão de Débito' },
  { id: 10, name: 'Pix' },
];

// Rota GET para buscar formas de pagamento disponíveis
app.get('/api/payments', (req, res) => {
  res.json(payments);
});

// Função auxiliar para gerar idOrder único simples
function generateOrderId() {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  const random = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0');
  return `${yyyy}${MM}${dd}${hh}${mm}${ss}${ms}${random}`;
}

// Garante que a pasta de logs exista
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Função para gravar cada transação em um arquivo JSON separado (identado)
function saveTransactionToFile(transaction) {
  // Usa o idTransaction como parte do nome do arquivo para facilitar rastreio
  const safeId = String(transaction.idTransaction || generateOrderId()).replace(
    /[^a-zA-Z0-9_-]/g,
    '_',
  );
  const fileName = `transaction-${safeId}.json`;
  const filePath = path.join(logsDir, fileName);

  const jsonContent = JSON.stringify(transaction, null, 2); // identado com 2 espaços
  fs.writeFileSync(filePath, jsonContent, { encoding: 'utf8' });
}

// Rota POST para receber dados da transação
app.post('/api/transactions', (req, res) => {
  const body = req.body || {};

  // Monta objeto completo da transação, preenchendo ids se faltarem
  const transaction = {
    idTransaction: body.idTransaction || uuidv4(),
    idOrder: body.idOrder || generateOrderId(),
    payment: body.payment, // esperado: string com forma de pagamento
    valuePay: body.valuePay,
    transactionPay: body.transactionPay,
    brand: body.brand,
    numberDocument: body.numberDocument,
    autorizeNumber: body.autorizeNumber,
    // Campos auxiliares para rastreio
    channel: body.channel || 'API',
    createdAt: new Date().toISOString(),
    rawPayload: body,
  };

  // Validações simples
  if (!transaction.payment) {
    return res.status(400).json({ error: 'Campo payment é obrigatório.' });
  }
  if (transaction.valuePay == null || isNaN(Number(transaction.valuePay))) {
    return res.status(400).json({ error: 'Campo valuePay é obrigatório e deve ser numérico.' });
  }

  try {
    saveTransactionToFile(transaction);
    return res.status(201).json({
      message: 'Transação registrada com sucesso.',
      transaction,
    });
  } catch (err) {
    console.error('Erro ao salvar transação em arquivo:', err);
    return res.status(500).json({ error: 'Erro ao salvar transação.' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
  console.log(`GET  /payments`);
  console.log(`POST /transactions`);
});


