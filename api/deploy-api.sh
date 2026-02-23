# Login to Azure Container Registry
az acr login --name cloudstruccacr

# Build and push (no cache to ensure fresh build)
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  -t cloudstruccacr.azurecr.io/api:latest \
  --push .

# Verify image was pushed
az acr repository show-tags \
  --name cloudstruccacr \
  --repository api \
  --output table