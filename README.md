#  Loja Veloz - 

O **Loja Veloz** é uma plataforma de e-commerce desenvolvida utilizando uma arquitetura de **Microsserviços**, orientada a eventos e totalmente containerizada, preparada para execução em ambientes **Docker** e **Kubernetes**.

---

##  Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| **Node.js (Express)** | Desenvolvimento dos microsserviços |
| **PostgreSQL** | Banco de dados relacional |
| **RabbitMQ** | Comunicação assíncrona entre serviços |
| **Docker** | Containerização das aplicações |
| **Docker Compose** | Orquestração do ambiente local |
| **Kubernetes (K8s)** | Orquestração dos containers em produção |
| **GitHub Actions** | Pipeline de Integração e Entrega Contínua (CI/CD) |

---

##  Arquitetura

O projeto é composto pelos seguintes microsserviços:

- API Gateway
- Serviço de Pedidos
- Serviço de Pagamentos
- Serviço de Estoque

Infraestrutura de suporte:

- PostgreSQL
- RabbitMQ

---

##  Como Executar o Projeto Localmente

### Pré-requisitos

Antes de iniciar, certifique-se de possuir:

- Docker Desktop instalado e em execução.
- Git instalado.

---

### Subindo toda a infraestrutura

Na raiz do projeto execute:

```bash
docker compose up -d --build
```

O comando acima irá:

- Construir todas as imagens Docker;
- Criar os containers;
- Iniciar os microsserviços;
- Inicializar PostgreSQL e RabbitMQ.

---

### Verificando os containers

```bash
docker compose ps
```

Exemplo de saída:

```
NAME                  STATUS
api-gateway           Up
pedidos               Up
pagamentos            Up
estoque               Up
postgres              Up
rabbitmq              Up
```

---

##  Implantação no Kubernetes

Para aplicar todos os manifestos presentes na pasta `k8s`:

```bash
kubectl apply -f k8s/
```

---

## Verificando os Pods

```bash
kubectl get pods
```

Exemplo:

```
NAME                          STATUS
api-gateway                   Running
pedidos                       Running
pagamentos                    Running
estoque                       Running
```

---

##  Testando a API

### Criando um Pedido

Utilize o PowerShell para enviar uma requisição para o serviço de pedidos.

```powershell
$body = '{"produtoId":"produto-1","quantidade":3}'

Invoke-RestMethod `
    -Uri "http://localhost:8080/pedidos" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

##  Monitorando os Logs

Para acompanhar em tempo real o serviço de estoque:

```bash
docker compose logs -f estoque
```

Também é possível visualizar os logs de qualquer outro serviço:

```bash
docker compose logs -f pedidos
```

```bash
docker compose logs -f pagamentos
```

```bash
docker compose logs -f api-gateway
```

---

# 📁 Estrutura do Projeto

```
Loja-Veloz/
│
├── api-gateway/
├── pedidos/
├── pagamentos/
├── estoque/
│
├── k8s/
│   ├── api-gateway.yaml
│   ├── pedidos.yaml
│   ├── pagamentos.yaml
│   ├── estoque.yaml
│   └── ...
│
├── docker-compose.yml
├── README.md
└── .github/
    └── workflows/
```

---

#  Fluxo da Aplicação

```text
Cliente
    │
    ▼
API Gateway
    │
    ├────────► Pedidos
    │             │
    │             ▼
    │         RabbitMQ
    │             │
    │      ┌──────┴──────┐
    ▼      ▼             ▼
Estoque            Pagamentos
    │
    ▼
PostgreSQL
```

---

#  CI/CD

O projeto utiliza **GitHub Actions** para automatizar:

- Build dos microsserviços
- Execução de testes
- Build das imagens Docker
- Publicação das imagens (quando configurado)
- Deploy para Kubernetes

---

