# Estágio de Build/Execução enxuto usando Alpine Linux
FROM node:18-alpine

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro 
COPY package*.json ./
RUN npm install --only=production

# Copia o resto do código
COPY . .

# Prática de Segurança: Rodar como usuário não-root
USER node

EXPOSE 3000

CMD ["node", "app.js"]