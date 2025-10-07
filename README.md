# nb-server

Backend API server for the No Baddies application.

## Tech Stack

- **Runtime**: Deno 2.5.3
- **Framework**: Hono
- **Database**: PostgreSQL 15
- **ORM**: Drizzle
- **Authentication**: Better Auth
- **Deployment**: Dokploy

## Development

### Prerequisites

- Deno 2.5.3+
- PostgreSQL 15

### Installation

```sh
bun install
```

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgres://myuser:mysecretpassword@localhost:5432/mydb
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=mysecretpassword
DB_NAME=mydb
DB_PORT=5432
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:8000
```

### Run Development Server

```sh
bun run dev
```

The server will be available at http://localhost:8000

### Health Check

```sh
curl http://localhost:8000/health
```

## Docker Deployment

### Using Docker Compose

```sh
docker compose -f Docker/docker-compose.yml up -d
```

This will start:
- PostgreSQL database on port 5432
- Application server on port 8000

### Services

- **Database**: `nb-server-db` - PostgreSQL with health checks
- **Application**: `nb-server-app` - Deno application with automatic migrations

## API Testing

### Bruno API Tests

API tests are located in the `bruno/` directory.

#### Run Tests Locally

```sh
# Install Bruno CLI
npm install -g @usebruno/cli

# Run tests
cd bruno
bru run --env Dev
```

#### CI/CD Testing

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

See `.github/workflows/bruno-api-tests.yml` for details.

## Deployment

### Dokploy Webhook

To trigger a deployment, use this webhook URL:

```
http://192.168.1.34:3000/api/deploy/Y0gNf60TPogEC9yOi4oNp
```

**Note**: This webhook is on the local network and only accessible from within the network or via SSH tunnel.

### Manual Deployment

```sh
curl -X POST http://192.168.1.34:3000/api/deploy/Y0gNf60TPogEC9yOi4oNp
```

## Project Structure

```
.
├── src/
│   ├── index.ts           # Application entry point
│   ├── lib/
│   │   └── auth.ts        # Better Auth configuration
│   └── routes/
│       ├── auth/          # Authentication routes
│       └── posts/         # Posts routes
├── drizzle/               # Database migrations
├── bruno/                 # API tests
├── Docker/
│   ├── docker-compose.yml # Docker Compose configuration
│   └── database/          # Database Dockerfile
├── .github/workflows/     # CI/CD workflows
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/sign-up/email` - Sign up with email
- `POST /api/auth/sign-in/email` - Sign in with email
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Sign out

### Posts

- `POST /posts` - Create a new post (authenticated)
- `GET /posts` - Get all posts for current user (authenticated)

### Health

- `GET /health` - Health check endpoint

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `cd bruno && bru run --env Dev`
4. Submit a pull request

## License

Private - All rights reserved
