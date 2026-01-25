# 1. Kill whatever is on port 6379
lsof -ti:6379 | xargs kill -9

# 2. Kill port 3000 too while we're at it
lsof -ti:3000 | xargs kill -9

# 3. Start fresh with Docker
docker-compose down
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f