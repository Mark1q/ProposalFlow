# Local purposes

docker run -d \
  --name redis-dev \
  -p 6379:6379 \
  -v redis_data:/data \
  --memory="512m" \
  --restart unless-stopped \
  redis:alpine \
  redis-server --appendonly yes --maxmemory 450mb