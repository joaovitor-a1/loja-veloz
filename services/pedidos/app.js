const express = require('express');
const { Client } = require('pg');
const amqp = require('amqp-connection-manager');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'fila_pedidos';

// Configurações vindas das variáveis de ambiente
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'veloz_user',
  password: process.env.DB_PASSWORD || 'local_password',
  database: process.env.DB_NAME || 'pedidos_db',
  port: process.env.DB_PORT || 5432,
};

let rabbitConectado = false;

// 🔌 Configurando o gerenciador de conexão do RabbitMQ
const conexaoWrapper = amqp.connect([RABBITMQ_URL]);
const canalWrapper = conexaoWrapper.createChannel({
  json: true,
  setup: (channel) => {
    return channel.assertQueue(QUEUE_NAME, { durable: true });
  },
});

conexaoWrapper.on('connect', () => {
  rabbitConectado = true;
  console.log('✅ [Pedidos] Conectado ao RabbitMQ com sucesso!');
});

conexaoWrapper.on('disconnect', (err) => {
  rabbitConectado = false;
  console.error('❌ [Pedidos] Desconectado do RabbitMQ:', err?.err?.message || err);
});

// 🩺 1. Liveness Probe (O container está vivo?)
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'pedidos' });
});

// 🩺 2. Readiness Probe & Health Geral (O banco e a fila estão prontos?)
app.get('/health', async (req, res) => {
  let dbStatus = 'DISCONNECTED';

  // Teste de conexão dinâmica com o PostgreSQL
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('SELECT 1');
    dbStatus = 'CONNECTED';
    await client.end();
  } catch (error) {
    dbStatus = `ERROR: ${error.message}`;
  }

  const isHealthy = dbStatus === 'CONNECTED' && rabbitConectado;

  const healthData = {
    status: isHealthy ? 'UP' : 'DOWN',
    database: dbStatus,
    rabbitmq: rabbitConectado ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  };

  if (isHealthy) {
    return res.status(200).json(healthData);
  } else {
    // Retorna HTTP 500 se algum componente vital falhar
    return res.status(500).json(healthData);
  }
});

// 🛒 Rota real de Pedidos
app.post('/pedidos', async (req, res) => {
  const { produtoId, quantity } = req.body;
  const qtd = quantity || req.body.quantidade || 1; 

  const novoPedido = {
    id: Math.floor(Math.random() * 100000),
    produtoId: produtoId || 'produto-1',
    quantidade: parseInt(qtd)
  };

  console.log(`🛒 [Pedidos] Processando novo pedido ID: ${novoPedido.id}`);

  try {
    // 🔥 Envia o evento real para a fila do RabbitMQ
    await canalWrapper.sendToQueue(QUEUE_NAME, novoPedido, { persistent: true });
    console.log(`📣 [Pedidos] Evento enviado para a fila: ${QUEUE_NAME}`);

    res.status(201).json({ 
      message: 'Pedido recebido com sucesso!', 
      pedido: novoPedido 
    });
  } catch (error) {
    console.error('❌ Erro ao enviar pedido para a fila:', error);
    res.status(500).json({ error: 'Erro interno ao processar o pedido' });
  }
});

app.listen(PORT, () => console.log(`🚀 Serviço de Pedidos rodando na porta ${PORT}`));