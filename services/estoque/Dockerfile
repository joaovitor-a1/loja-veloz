FROM node:18-alpine

WORKDIR /usr/src/app

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package*.json ./


RUN npm init -y && npm install amqplib

COPY . .


USER node

CMD ["node", "app.js"]