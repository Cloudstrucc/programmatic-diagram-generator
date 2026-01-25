# Create directory
mkdir ./webapp-frontend
cd ./webapp-frontend

# Create structure
mkdir -p config controllers models middleware services routes
mkdir -p public/{css,js,images}
mkdir -p views/{layouts,partials}

# Install dependencies
npm install

# Copy .env
cp .env.example .env
vim .env

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb-webapp mongo:latest

# Start app
npm start