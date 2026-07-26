const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

const PEDIDOS_SERVICE_URL = process.env.PEDIDOS_SERVICE_URL || 'http://localhost:3000';

console.log(`🚀 [Gateway] Configurando rotas para: ${PEDIDOS_SERVICE_URL}`);

// 🩺 1. Endpoints de Health Check (Observabilidade e Probes do Kubernetes)
app.get('/health/live', (req, res) => {
    return res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

app.get('/health', (req, res) => {
    return res.status(200).json({
        status: 'UP',
        service: 'api-gateway',
        targetService: PEDIDOS_SERVICE_URL,
        timestamp: new Date().toISOString()
    });
});

// 🔀 2. Proxy transparente para repassar todas as rotas da aplicação
app.use(createProxyMiddleware({
    target: PEDIDOS_SERVICE_URL,
    changeOrigin: true,
    logger: console
}));

app.listen(PORT, () => {
    console.log(`🔒 API Gateway centralizado rodando na porta ${PORT}`);
});