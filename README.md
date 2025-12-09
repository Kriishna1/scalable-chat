# Scalable Chat Application

A horizontally scalable real-time chat application built with modern web technologies and distributed systems architecture.

## Architecture Overview

This application demonstrates a scalable chat system using Redis pub/sub, Apache Kafka, PostgreSQL, and Socket.IO in a microservices architecture.

```mermaid
graph TB
    subgraph "Client Layer"
        Client1[Web Client 1]
        Client2[Web Client 2]
        Client3[Web Client N]
    end
    
    subgraph "Application Layer"
        Server1[Socket.IO Server 1]
        Server2[Socket.IO Server 2]
        Server3[Socket.IO Server N]
    end
    
    subgraph "Message Distribution"
        Redis[(Redis Pub/Sub)]
    end
    
    subgraph "Message Queue"
        Kafka[(Apache Kafka)]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL)]
    end
    
    Client1 <-->|WebSocket| Server1
    Client2 <-->|WebSocket| Server2
    Client3 <-->|WebSocket| Server3
    
    Server1 <-->|Publish/Subscribe| Redis
    Server2 <-->|Publish/Subscribe| Redis
    Server3 <-->|Publish/Subscribe| Redis
    
    Server1 -->|Produce| Kafka
    Server2 -->|Produce| Kafka
    Server3 -->|Produce| Kafka
    
    Kafka -->|Consume| Server1
    Server1 -->|Persist| Postgres
    
    style Client1 fill:#e1f5ff
    style Client2 fill:#e1f5ff
    style Client3 fill:#e1f5ff
    style Redis fill:#ff6b6b
    style Kafka fill:#4ecdc4
    style Postgres fill:#45b7d1
```

##  Message Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant SocketIO as Socket.IO Server
    participant Redis
    participant Kafka
    participant Consumer as Kafka Consumer
    participant DB as PostgreSQL
    participant OtherClients as Other Clients

    Client->>SocketIO: Send Message (WebSocket)
    SocketIO->>Redis: Publish to MESSAGES channel
    Redis-->>SocketIO: Broadcast to all servers
    SocketIO->>OtherClients: Emit via WebSocket
    SocketIO->>Kafka: Produce to MESSAGES topic
    Kafka->>Consumer: Consume message
    Consumer->>DB: Persist message
    
    Note over Consumer,DB: On Error: Pause 60s
```

##  System Components

```mermaid
graph LR
    subgraph "Frontend - Next.js"
        UI[React Components]
        Socket[Socket.IO Client]
        Context[Context Providers]
    end
    
    subgraph "Backend - Node.js"
        API[Socket.IO Server]
        RedisClient[Redis Client]
        KafkaProducer[Kafka Producer]
        KafkaConsumer[Kafka Consumer]
        Prisma[Prisma ORM]
    end
    
    subgraph "Infrastructure"
        RedisServer[Redis<br/>Message Broker]
        KafkaCluster[Kafka Cluster<br/>Aiven Cloud]
        PostgresDB[PostgreSQL<br/>Aiven Cloud]
    end
    
    UI --> Socket
    Socket <--> API
    API <--> RedisClient
    API --> KafkaProducer
    KafkaConsumer --> Prisma
    
    RedisClient <--> RedisServer
    KafkaProducer --> KafkaCluster
    KafkaConsumer <-- KafkaCluster
    Prisma --> PostgresDB
    
    style RedisServer fill:#ff6b6b
    style KafkaCluster fill:#4ecdc4
    style PostgresDB fill:#45b7d1
```

##  Key Features

### Scalability
- **Horizontal Scaling**: Multiple Socket.IO servers can run simultaneously
- **Redis Pub/Sub**: Ensures message delivery across all server instances
- **Kafka Message Queue**: Decouples message processing from real-time delivery
- **Distributed Architecture**: Each component can scale independently

### Reliability
- **Message Persistence**: All messages stored in PostgreSQL via Kafka consumers
- **Error Recovery**: Consumer auto-pauses on database errors (60s cooldown)
- **Fault Tolerance**: Redis and Kafka provide message buffering

### Real-time Communication
- **WebSocket Connections**: Bi-directional communication via Socket.IO
- **Instant Delivery**: Redis pub/sub for sub-millisecond message distribution
- **Multi-server Support**: Clients connected to different servers see the same messages

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Socket.IO Client** - WebSocket communication
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime environment
- **Socket.IO** - Real-time bidirectional communication
- **Redis** - In-memory pub/sub message broker
- **Apache Kafka** - Distributed event streaming (Aiven Cloud)
- **PostgreSQL** - Relational database (Aiven Cloud)
- **Prisma** - Modern ORM for database operations

### DevOps
- **Docker** - Redis containerization
- **Turborepo** - Monorepo build system
- **TypeScript** - End-to-end type safety

##  Project Structure

```
scalable-chat/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/               # App router pages
│   │   └── contexts/          # Socket context provider
│   └── server/                # Backend server
│       ├── src/
│       │   ├── index.ts       # Entry point
│       │   └── services/
│       │       ├── socket.ts  # Socket.IO + Redis
│       │       ├── kafka.ts   # Kafka producer/consumer
│       │       └── prisma.ts  # Database client
│       ├── prisma/
│       │   └── schema.prisma  # Database schema
│       └── docker-compose.yml # Redis container
└── packages/
    ├── ui/                    # Shared UI components
    ├── eslint-config/         # ESLint configs
    └── typescript-config/     # TypeScript configs
```

##  Setup & Installation

### Prerequisites
- Node.js >= 18
- Docker Desktop
- Aiven account (for Kafka & PostgreSQL)
- Yarn package manager

### Environment Variables

Create `.env` in `apps/server/`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_DB=0

# Server Configuration
PORT=8000

# PostgreSQL (Aiven)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Kafka Configuration (Aiven)
KAFKA_BROKER=kafka-xxxxx.aivencloud.com:12345
KAFKA_USERNAME=avnadmin
KAFKA_PASSWORD=your-kafka-password
```

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Kriishna1/scalable-chat.git
cd scalable-chat
```

2. **Install dependencies**
```bash
yarn install
```

3. **Start Redis**
```bash
cd apps/server
docker compose up -d
```

4. **Setup Aiven Services**
   - Create Kafka service and download SSL certificate as `ca.pem`
   - Create PostgreSQL service
   - Update `.env` with connection details

5. **Generate Prisma Client**
```bash
yarn workspace server prisma generate
```

6. **Run database migrations**
```bash
yarn workspace server prisma migrate dev
```

7. **Start development servers**
```bash
yarn dev
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

##  How It Works

### Message Flow

1. **Client sends message** → WebSocket to Socket.IO server
2. **Server publishes to Redis** → All server instances receive the message
3. **Broadcast to connected clients** → Real-time delivery via WebSocket
4. **Produce to Kafka** → Message queued for persistence
5. **Kafka consumer processes** → Message saved to PostgreSQL
6. **Error handling** → Consumer pauses on DB errors, auto-resumes after 60s

### Scaling Strategy

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[NGINX/HAProxy]
    end
    
    subgraph "Server Cluster"
        S1[Server Instance 1]
        S2[Server Instance 2]
        S3[Server Instance 3]
    end
    
    subgraph "Shared State"
        R[Redis Pub/Sub]
        K[Kafka Cluster]
    end
    
    Users --> LB
    LB --> S1
    LB --> S2
    LB --> S3
    
    S1 <--> R
    S2 <--> R
    S3 <--> R
    
    S1 --> K
    S2 --> K
    S3 --> K
```

##  Database Schema

```prisma
model Message {
  id        String   @id @default(uuid())
  text      String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("messages")
}
```

##  Testing the Scalability

1. Start multiple server instances on different ports
2. Open multiple browser tabs
3. Send messages from different tabs
4. Verify all clients receive messages in real-time
5. Check PostgreSQL for persisted messages

##  Production Considerations

- **Load Balancing**: Use NGINX or HAProxy with sticky sessions
- **SSL/TLS**: Enable HTTPS for Socket.IO connections
- **Environment Separation**: Use different Kafka topics per environment
- **Monitoring**: Implement logging and metrics (Prometheus, Grafana)
- **Auto-scaling**: Configure based on CPU/memory metrics
- **Message Retention**: Configure Kafka retention policies
- **Database Indexing**: Add indexes on frequently queried fields

## Learn 

- [Socket.IO Documentation](https://socket.io/docs/)
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub/)
- [Apache Kafka](https://kafka.apache.org/documentation/)
- [Prisma ORM](https://www.prisma.io/docs)
- [Next.js](https://nextjs.org/docs)
- [Turborepo](https://turborepo.com/docs)



