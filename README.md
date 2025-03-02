# ElysiaPro - Elysia.js Backend Template

A production-ready backend template using Elysia.js with Bun runtime, MongoDB, and Redis for building scalable and secure APIs.

## Features

- **🚀 Bun & Elysia.js** - Ultra-fast TypeScript runtime with modern web framework
- **🔐 Authentication** - JWT-based authentication with role-based access control
- **📦 MongoDB Integration** - Complete repository pattern for MongoDB
- **🔄 Redis Session Management** - Fast token validation and session management
- **📝 Swagger Documentation** - Auto-generated API documentation
- **👩‍💻 Admin API** - React Admin compatible endpoints
- **🔧 Environment Configuration** - Type-safe environment variables
- **⬆️ File Upload** - Built-in file upload support with MinIO integration
- **🛠️ Docker Support** - Easy local development and production deployment

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Docker](https://www.docker.com/) and Docker Compose (for local development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/elysiapro.git
cd elysiapro
```

2. Install dependencies
```bash
bun install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB and Redis with Docker Compose
```bash
docker compose up -d
```

5. Run the development server
```bash
bun run dev
```

6. Visit Swagger UI at http://localhost:3000/swagger to see available APIs

## Project Structure

```
src/
├── config.ts                 # Environment configuration
├── index.ts                  # Application entry point
├── modules/                  # Application modules
│   ├── App/                  # Main application setup
│   ├── Auth/                 # Authentication and authorization
│   ├── Database/             # Database configuration and repositories  
│   ├── User/                 # User management
│   ├── Role/                 # Role management
│   └── Upload/               # File upload handling
└── utils/                    # Utility functions and providers
```

## API Documentation

The API is self-documented using Swagger UI. After starting the server, access:

- **API Documentation**: http://localhost:3000/swagger

### Main API Endpoints

- **Authentication**: `/api/auth/*` - Login, register, token refresh
- **User Management**: `/api/users/*` - User CRUD operations
- **Admin Panel**: `/api/admin/*` - React Admin compatible endpoints

## Development

For local development:

```bash
# Start MongoDB and Redis
docker compose up -d

# Run development server with hot reload
bun run dev
```

## Production Deployment

For production deployment using Docker:

```bash
# Build the production image
docker build -t elysiapro .

# Run the container
docker run -p 3000:3000 --env-file .env elysiapro
```

### Using Docker Compose for Production

Create a `docker-compose.prod.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
  redis_data:
```

Then run:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.