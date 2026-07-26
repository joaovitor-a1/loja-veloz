const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq-service:5672';
const QUEUE_NAME = 'fila_pedidos';

async function iniciarPagamentos() {
  try {
    console.log('💳 [Pagamentos] Conectando ao RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`💳 [Pagamentos] Escutando eventos na fila: ${QUEUE_NAME}...`);

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const evento = JSON.parse(msg.content.toString());
        console.log(`\n💳 [Novo Pedido] Processando pagamento para o Pedido ID: ${evento.id}`);

        // Simula o processamento do pagamento
        setTimeout(() => {
          console.log(`✅ [Sucesso] Pagamento APROVADO para o Pedido ID: ${evento.id}!`);
         
        }, 1000);
      }
    }, { noAck: true });

  } catch (error) {
    console.error('❌ Erro no Serviço de Pagamentos:', error);
    setTimeout(iniciarPagamentos, 5000);
  }
}

iniciarPagamentos();