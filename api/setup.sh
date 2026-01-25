#!/bin/bash
# setup.sh - Quick setup script for Diagram API Server

set -e

echo "======================================"
echo "Diagram API Server - Setup Script"
echo "======================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required. Current version: $(node -v)"
    exit 1
fi
echo "✓ Node.js version: $(node -v)"

# Check if MongoDB is running
echo ""
echo "Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB client not found. Please ensure MongoDB is installed and running."
    echo "   You can start MongoDB using Docker:"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
else
    echo "✓ MongoDB client found"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"

# Create .env file if it doesn't exist
echo ""
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your ANTHROPIC_API_KEY and other settings"
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

# Check if ANTHROPIC_API_KEY is set
echo ""
source .env
if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-your-key-here" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set in .env file"
    echo "   Please add your Anthropic API key to continue"
    echo ""
    echo "   You can get your API key from: https://console.anthropic.com/"
else
    echo "✓ ANTHROPIC_API_KEY is configured"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set, using default: mongodb://localhost:27017/diagram_api"
else
    echo "✓ DATABASE_URL is configured"
fi

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file and add your ANTHROPIC_API_KEY"
echo "   nano .env"
echo ""
echo "2. Ensure MongoDB is running:"
echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Or start in production mode:"
echo "   npm start"
echo ""
echo "5. Test the API:"
echo "   curl http://localhost:3000/health"
echo ""
echo "6. Run the client example:"
echo "   node client-example.js"
echo ""
echo "======================================"
