# Login to Azure Container Registry (if not already)
az acr login --name cloudstruccacr

# Build and push
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  -t cloudstruccacr.azurecr.io/webapp:latest \
  --push .

# Verify image was pushed
az acr repository show-tags \
  --name cloudstruccacr \
  --repository webapp \
  --output table