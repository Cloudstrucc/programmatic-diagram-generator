#!/bin/bash
# Run this script in the folder where you downloaded the files

echo "Creating webapp-frontend structure..."

# Create structure
mkdir -p webapp-frontend/{config,models,services,middleware,routes}
mkdir -p webapp-frontend/views/{layouts,partials}
mkdir -p webapp-frontend/public/{css,js,images}

# Copy and rename files
echo "Organizing files..."

# Root files
cp webapp-server.js webapp-frontend/server.js
cp webapp-app.js webapp-frontend/app.js
cp webapp-package.json webapp-frontend/package.json
cp WEBAPP-ENV-FILE.env webapp-frontend/.env
cp webapp-env-example.txt webapp-frontend/.env.example
cp WEBAPP-README.md webapp-frontend/README.md

# Config
cp webapp-config-passport.js webapp-frontend/config/passport.js

# Models
cp webapp-models-User.js webapp-frontend/models/User.js
cp webapp-models-Diagram.js webapp-frontend/models/Diagram.js

# Services
cp webapp-services-diagramApiClient.js webapp-frontend/services/diagramApiClient.js

# Middleware
cp webapp-middleware-auth.js webapp-frontend/middleware/auth.js

# Routes
cp webapp-routes-index.js webapp-frontend/routes/index.js
cp webapp-routes-auth.js webapp-frontend/routes/auth.js
cp webapp-routes-diagrams.js webapp-frontend/routes/diagrams.js

# Views
cp webapp-views-layouts-main.hbs webapp-frontend/views/layouts/main.hbs
cp webapp-views-partials-navbar.hbs webapp-frontend/views/partials/navbar.hbs
cp webapp-views-partials-footer.hbs webapp-frontend/views/partials/footer.hbs
cp webapp-views-home.hbs webapp-frontend/views/home.hbs
cp webapp-views-login.hbs webapp-frontend/views/login.hbs
cp webapp-views-register.hbs webapp-frontend/views/register.hbs

# Public
cp webapp-public-css-style.css webapp-frontend/public/css/style.css
cp webapp-public-js-main.js webapp-frontend/public/js/main.js
cp webapp-public-js-diagram-generator.js webapp-frontend/public/js/diagram-generator.js

# Create .gitignore
cat > webapp-frontend/.gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
EOF

echo ""
echo "✅ All files organized in webapp-frontend/"
echo ""
echo "Next steps:"
echo "  cd webapp-frontend"
echo "  npm install"
echo "  nano .env  # Update your config"
echo "  npm start"
echo ""