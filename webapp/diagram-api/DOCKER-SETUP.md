# Docker Setup for Diagram API

## 📦 Files Needed

Make sure you have these files in your `/diagram-api` directory:

1. **Dockerfile** - Container definition
2. **docker-compose.yml** - Multi-container orchestration
3. **.dockerignore** - Files to exclude from Docker
4. **.env** - Environment variables

## 🚀 Quick Start

### 1. Start Docker Desktop

```bash
open -a Docker
# Wait 30 seconds for it to start
```

### 2. Create .env File

```bash
cd /Users/frederickpearson/repos/programmatic-diagram-generator/webapp/diagram-api

# Copy the example
cp .env.example .env

# Edit with your keys
nano .env
```

Add your actual keys:
```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Build and Start Everything

```bash
# Build the containers (first time only)
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Just API
docker-compose logs -f api

# Just MongoDB
docker-compose logs -f mongodb
```

## 🧪 Test the API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Get JWT Token

```bash
# Save the pre-made token
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlLZXkiOiJ0ZXN0LWtleSIsInRpZXIiOiJmcmVlIiwiaWF0IjoxNzM3ODA0MDAwLCJleHAiOjE3NDAzOTYwMDB9.8gqK6X1vZ5L6kX3FyQXxI7QT8zN9mR4bS2cV7wE8pY0" > .jwt-token
```

### 3. Get Templates

```bash
curl http://localhost:3000/api/diagram/templates \
  -H "Authorization: Bearer $(cat .jwt-token)"
```

### 4. Generate a Diagram

```bash
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "3-tier web application with load balancer",
    "diagramType": "drawio",
    "templateType": "aws"
  }'
```

## 🔧 Docker Commands

### Start/Stop

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Restart just API
docker-compose restart api
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# View last 100 lines
docker-compose logs --tail=100 api
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Or rebuild specific service
docker-compose build api
docker-compose up -d api
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes too (deletes database data!)
docker-compose down -v

# Remove everything including images
docker-compose down -v --rmi all
```

## 📊 Check Container Status

```bash
# See running containers
docker-compose ps

# See all containers (including stopped)
docker ps -a

# Check resource usage
docker stats
```

## 🐛 Troubleshooting

### "Port already allocated"

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:6379 | xargs kill -9
lsof -ti:27017 | xargs kill -9

# Clean Docker
docker-compose down
docker container prune -f
docker network prune -f

# Restart
docker-compose up -d
```

### "Cannot connect to Docker daemon"

```bash
# Restart Docker Desktop
osascript -e 'quit app "Docker"'
sleep 5
open -a Docker
sleep 30

# Try again
docker-compose up -d
```

### View API Container Shell

```bash
# Enter the container
docker-compose exec api sh

# Check files
ls -la

# Check environment
env | grep MONGODB

# Exit
exit
```

### Check MongoDB Connection

```bash
# Enter MongoDB container
docker-compose exec mongodb mongosh

# Show databases
show dbs

# Use diagram-api database
use diagram-api

# Show collections
show collections

# Exit
exit
```

## 📁 Directory Structure

```
diagram-api/
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-container setup
├── .dockerignore          # Files to exclude
├── .env                   # Environment variables (gitignored)
├── .env.example           # Template for .env
├── server.js              # Your API server
├── package.json           # Node dependencies
├── routes/                # API routes
├── services/              # Business logic
├── middleware/            # Auth, etc.
└── diagrams/              # Generated diagrams (persisted)
```

## 🔐 Environment Variables

The `.env` file is loaded by Docker Compose and passed to the API container.

**Required:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `JWT_SECRET` - Secret for JWT tokens

**Auto-configured by Docker:**
- `MONGODB_URI=mongodb://mongodb:27017/diagram-api`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`

## 🎯 Complete Workflow

```bash
# 1. Start Docker Desktop
open -a Docker && sleep 30

# 2. Create .env file
cp .env.example .env
# Edit .env with your keys

# 3. Build and start
docker-compose build
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f

# 6. Test API
curl http://localhost:3000/health

# 7. Generate diagram
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{"prompt":"web app","diagramType":"drawio","templateType":"aws"}'
```

## 📊 Production Deployment

For production, update `docker-compose.yml`:

```yaml
services:
  api:
    build: .
    restart: always  # Always restart on failure
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 🎉 Success!

Once everything is running:
- API: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379