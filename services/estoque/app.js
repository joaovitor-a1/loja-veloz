const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'fila_pedidos';

// Simulando um banco de dados em memória para o estoque de produtos
const estoque = {
  'produto-1': 50, // Tem 50 unidades do produto 1
  'produto-2': 10,
};

async function iniciarEstoque() {
  try {
    // Conecta no servidor de mensageria (RabbitMQ)
    const conexao = await amqp.connect(RABBITMQ_URL);
    const canal = await conexao.createChannel();
    
    // Garante que a fila de pedidos existe
    await canal.assertQueue(QUEUE_NAME, { durable: true });
    
    console.log(`[Estoque] Aguardando mensagens na fila: ${QUEUE_NAME}...`);

    // Consome as mensagens da fila
    canal.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const pedido = JSON.parse(msg.content.toString());
        console.log(`\n📦 [Novo Evento] Pedido recebido! ID: ${pedido.id}`);
        
        const { produtoId, quantidade } = pedido;

        // Lógica de baixa no estoque
        if (estoque[produtoId] !== undefined) {
          if (estoque[produtoId] >= quantidade) {
            estoque[produtoId] -= quantidade;
            console.log(`✅ [Sucesso] Baixa realizada! Produto: ${produtoId} | Restam: ${estoque[produtoId]} unidades.`);
          } else {
            console.log(`❌ [Erro] Estoque insuficiente para o produto: ${produtoId}`);
          }
        } else {
          console.log(`⚠️ [Alerta] Produto ${produtoId} não encontrado no catálogo de estoque.`);
        }

        // Confirma para o RabbitMQ que a mensagem foi processada com sucesso
        canal.ack(msg);
      }
    });

  } catch (erro) {
    console.error('❌ Erro ao iniciar o Serviço de Estoque:', erro);
    setTimeout(iniciarEstoque, 5000); // Tenta reconectar após 5 segundos se falhar
  }
}

iniciarEstoque();