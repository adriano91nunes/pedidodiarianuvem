# Sistema de Gestão de Diárias (SGDOP) - Arquitetura em Nuvem 🚀

Este documento unifica todo o guia de infraestrutura, orquestração e execução do ecossistema distribuído do SGDOP. Ele serve como roteiro completo para configurar, rodar e validar todos os serviços (Banco de Dados, Mensageria, Métricas e Dashboards) do absoluto zero.

---

## 🏗️ Arquitetura da Infraestrutura

O ambiente é totalmente orquestrado via Docker, isolando as dependências do sistema e garantindo a comunicação entre os seguintes serviços em rede:
* **Banco de Dados Relacional (PostgreSQL):** Substitui o antigo SQLite local por um banco em rede robusto e persistente.
* **Broker de Mensageria (RabbitMQ):** Middleware assíncrono responsável por receber os eventos de criação de diárias e gerenciar a fila de notificações.
* **Coletor de Métricas (Prometheus):** Agente que realiza raspagem (*scraping*) de telemetria ativa do NestJS a cada 5 segundos.
* **Painel Visual (Grafana):** Dashboard profissional conectado ao Prometheus para plotagem gráfica de performance, uso de CPU e Memória Heap.

---

## 📋 Pré-requisitos do Ambiente

Antes de iniciar, certifique-se de ter instalado no seu ambiente Linux (Ubuntu):
* **Docker & Docker Compose** (Atualizados)
* **Node.js** (Versão 20 ou superior)

---

## 🛠️ Configuração dos Arquivos de Infraestrutura (Raiz do Projeto)

Os dois arquivos abaixo devem ser criados na **pasta raiz** do seu projeto principal (onde fica o repositório global).

### 1. Arquivo `docker-compose.yml`
```yaml
version: '3.8'

services:
  # Banco de Dados Relacional
  postgres:
    image: postgres:15-alpine
    container_name: sgdop-postgres
    environment:
      POSTGRES_USER: adriano
      POSTGRES_PASSWORD: senha_secreta_diarias
      POSTGRES_DB: sgdop_nuvem
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rede-nuvem

  # Broker de Mensageria
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: sgdop-rabbitmq
    ports:
      - "5672:5672"   # Porta do protocolo AMQP
      - "15672:15672" # Painel administrativo visual
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    networks:
      - rede-nuvem

  # Coletor de Métricas
  prometheus:
    image: prom/prometheus:latest
    container_name: sgdop-prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    extra_hosts:
      - "host.docker.internal:host-gateway" # Permite ao container enxergar o host local
    networks:
      - rede-nuvem

  # Painel de Monitoramento Visual
  grafana:
    image: grafana/grafana:latest
    container_name: sgdop-grafana
    ports:
      - "3001:3000" # Mapeado na porta 3001 para evitar conflito com o NestJS
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    networks:
      - rede-nuvem

volumes:
  postgres_data:

networks:
  rede-nuvem:
    driver: bridge
```

### 2. Arquivo `prometheus.yml`
```yaml
global:
  scrape_interval: 5s # Tempo de amostragem de dados

scrape_configs:
  - job_name: 'nestjs-app'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['host.docker.internal:3000']
```

---

## 🚀 Passo a Passo para Ligar e Executar os Eventos

Siga rigorosamente a sequência de comandos abaixo no seu terminal para levantar o ecossistema:

### Passo 1: Inicializar a Infraestrutura Docker
Na pasta raiz onde estão os arquivos `.yml`, execute o comando para baixar as imagens oficiais e subir os containers em background:
```bash
sudo docker compose up -d
```
> ⚡ *Nota de suporte:* Caso o terminal acuse que a porta 3000 está ocupada por algum processo antigo do Node em background, derrube-o usando: `sudo fuser -k 3000/tcp`.

### Passo 2: Entrar na Pasta do Backend e Instalar as Dependências
Navegue para a subpasta do código-fonte do NestJS (onde fica o arquivo `package.json` do servidor):
```bash
cd pedido-diarias-senac
```
Execute a instalação em lote de todos os pacotes necessários para os microserviços, validações estruturais e telemetria:
```bash
npm install @nestjs/microservices amqplib amqp-connection-manager @willsoto/nestjs-prometheus prom-client class-validator class-transformer --save
```

### Passo 3: Sincronizar as Migrações do Banco de Dados
Rode o comando do Prisma para ler o Schema, conectar no container do PostgreSQL e criar a estrutura de tabelas do zero:
```bash
npx prisma migrate dev --name init_postgres
```

### Passo 4: Inicializar o Servidor NestJS
Ligue o motor da sua aplicação em modo de desenvolvimento:
```bash
npm run start:dev
```
Aguarde a confirmação de inicialização bem-sucedida nos logs do terminal:  
`[NestApplication] Nest application successfully started`.

---

## 🚦 Tabela de Portas, Endereços e Painéis Administrativos

Com a infraestrutura ativa, você pode monitorar e auditar os fluxos distribuídos através dos seguintes endereços locais:

| Serviço / Ferramenta | URL de Acesso no Navegador | Credenciais / Observações |
| :--- | :--- | :--- |
| **API Endpoints (NestJS)** | `http://localhost:3000/` | Endpoints da API mapeados na raiz |
| **Banquete de Dados (Métricas Raw)** | `http://localhost:3000/metrics` | Dados puros gerados para o Prometheus |
| **Painel de Controle do RabbitMQ** | `http://localhost:15672/` | Usuário: `guest` \| Senha: `guest` |
| **Status de Conexão do Prometheus** | `http://localhost:9090/targets` | Verifique o endpoint `nestjs-app` como **UP** (Verde) |
| **Painel Gráfico do Grafana** | `http://localhost:3001/` | Usuário: `admin` \| Senha: `admin` |

---

## 🧪 Roteiro de Teste Fim a Fim (Validação dos Requisitos)

Para validar a integração nativa dos serviços e provar que o circuito funciona de ponta a ponta, execute os passos abaixo:

1.  **Conexão do Grafana ao Prometheus:**
    * Acesse `http://localhost:3001` e faça login.
    * Vá em **Connections -> Data sources -> Add data source** e selecione **Prometheus**.
    * No campo *Prometheus server URL*, insira `http://prometheus:9090`. Role até o final e clique em **Save & test**.
    * Clique no ícone de `+` no topo, escolha **Import dashboard**, digite o ID universal **`11159`**, clique em **Load**, selecione a sua fonte do Prometheus e clique em **Import**.

2.  **Disparo de Requisições via REST Client:**
    * Abra o seu arquivo `teste.http` dentro do VS Code.
    * Clique em **Send Request** no **Teste 0 (POST /servidor)** para persistir o primeiro usuário no banco relacional PostgreSQL em rede.
    * Clique em **Send Request** no **Teste 1 (POST /diarias)** para salvar o pedido de diária calculada.

3.  **Auditoria Visual dos Fluxos:**
    * Acesse a aba *Queues and Streams* do **RabbitMQ** e veja a mensagem de notificação criada de forma assíncrona entrar na fila `diarias_notificacao` (Coluna *Ready* pulando para 1).
    * Acesse o painel do **Grafana** e veja as linhas dos gráficos se moverem, plotando os picos de uso de CPU, Event Loop e consumo de memória Heap gerados pelas requisições que você acabou de enviar.
```