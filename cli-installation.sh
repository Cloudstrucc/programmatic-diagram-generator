#!/bin/bash

echo "🔍 Installing ALL CLI dependencies..."
echo ""

cd cli 2>/dev/null || cd . # Stay in current dir if already in cli

# Install the complete set of dependencies
npm install \
  @anthropic-ai/sdk \
  dotenv \
  simple-git \
  commander \
  chalk \
  ora \
  inquirer \
  fs-extra

echo ""
echo "✅ All Node.js dependencies installed!"
echo ""
echo "📦 Installed packages:"
npm list --depth=0
echo ""
echo "🐍 Now installing Python dependencies..."
pip install diagrams graphviz anthropic --break-system-packages 2>/dev/null || \
pip install diagrams graphviz anthropic --user

echo ""
echo "✅ Setup complete!"
echo ""
echo "🧪 Test with:"
echo "   node ai-diagram.js list-templates"
echo ""