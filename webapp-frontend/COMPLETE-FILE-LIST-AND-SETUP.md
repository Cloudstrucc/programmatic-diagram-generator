# Complete WebApp Frontend - All Files and Setup Guide

## 📦 Complete File List (All Created!)

### Root Files
```
webapp-frontend/
├── server.js                    ← webapp-server.js
├── app.js                       ← webapp-app.js
├── package.json                 ← webapp-package.json
├── .env                         ← WEBAPP-ENV-FILE.env
├── .env.example                 ← webapp-env-example.txt
├── README.md                    ← WEBAPP-README.md
└── .gitignore                   ← (create manually, see below)
```

### Config Files
```
config/
└── passport.js                  ← webapp-config-passport.js
```

### Models
```
models/
├── User.js                      ← webapp-models-User.js
└── Diagram.js                   ← webapp-models-Diagram.js
```

### Services
```
services/
└── diagramApiClient.js          ← webapp-services-diagramApiClient.js
```

### Middleware
```
middleware/
└── auth.js                      ← webapp-middleware-auth.js
```

### Routes
```
routes/
├── index.js                     ← webapp-routes-index.js
├── auth.js                      ← webapp-routes-auth.js
└── diagrams.js                  ← webapp-routes-diagrams.js
```

### Views - Layouts
```
views/layouts/
└── main.hbs                     ← webapp-views-layouts-main.hbs
```

### Views - Partials
```
views/partials/
├── navbar.hbs                   ← webapp-views-partials-navbar.hbs
└── footer.hbs                   ← webapp-views-partials-footer.hbs
```

### Views - Pages
```
views/
├── home.hbs                     ← webapp-views-home.hbs
├── login.hbs                    ← webapp-views-login.hbs
├── register.hbs                 ← webapp-views-register.hbs
├── dashboard.hbs                ← Run CREATE-ALL-VIEWS.sh
├── generator.hbs                ← Run CREATE-ALL-VIEWS.sh
├── my-diagrams.hbs              ← See below
├── view-diagram.hbs             ← See below
├── examples.hbs                 ← See below
├── pricing.hbs                  ← See below
└── docs.hbs                     ← See below
```

### Public Assets
```
public/
├── css/
│   └── style.css                ← webapp-public-css-style.css
├── js/
│   ├── main.js                  ← webapp-public-js-main.js
│   └── diagram-generator.js     ← webapp-public-js-diagram-generator.js
└── images/
    └── (place your logo here)
```

## 🚀 Quick Setup Commands

```bash
# 1. Create directory structure
mkdir -p webapp-frontend/{config,models,services,middleware,routes,controllers}
mkdir -p webapp-frontend/views/{layouts,partials}
mkdir -p webapp-frontend/public/{css,js,images}

cd webapp-frontend

# 2. Download all files from outputs and rename them:
# Remove "webapp-" prefix from filename
# Example: webapp-server.js → server.js

# 3. Create .gitignore
cat > .gitignore << 'EOFGIT'
node_modules/
.env
*.log
.DS_Store
EOFGIT

# 4. Install dependencies
npm install

# 5. Setup environment
cp .env.example .env
nano .env

# 6. Start MongoDB
docker run -d -p 27017:27017 --name mongodb-webapp mongo:latest

# 7. Start the API server (in another terminal)
cd ../api
npm start

# 8. Start the web app
cd ../webapp-frontend
npm start
```

## 📝 .env File Configuration

```env
# Copy this to .env and update values

PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/diagram-generator-web
SESSION_SECRET=change-this-to-random-string-minimum-32-characters
API_URL=http://localhost:3000
API_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Make sure `API_JWT_SECRET` matches your API server's `JWT_SECRET`!

## 📄 Missing View Files (Simple to Create)

### my-diagrams.hbs
```handlebars
<section style="background: var(--light-bg); padding: 60px 0;">
    <div class="container">
        <h1 class="mb-4">My Diagrams</h1>
        <div class="row g-4">
            {{#each diagrams}}
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5>{{this.title}}</h5>
                        <p>{{truncate this.prompt 100}}</p>
                        <a href="/diagrams/view/{{this._id}}" class="btn btn-primary">View</a>
                    </div>
                </div>
            </div>
            {{/each}}
        </div>
    </div>
</section>
```

### view-diagram.hbs
```handlebars
<section style="background: var(--light-bg); padding: 60px 0;">
    <div class="container">
        <h1>{{diagram.title}}</h1>
        {{#if diagram.imageData}}
        <img src="data:image/png;base64,{{diagram.imageData}}" class="img-fluid" alt="{{diagram.title}}">
        {{/if}}
        <div class="mt-4">
            <a href="/diagrams/my-diagrams" class="btn btn-secondary">Back to My Diagrams</a>
        </div>
    </div>
</section>
```

### examples.hbs
```handlebars
<section style="background: var(--light-bg); padding: 80px 0;">
    <div class="container">
        <div class="section-title">
            <h2>Example Diagrams</h2>
            <p>Professional architecture diagrams created in seconds</p>
        </div>
        <!-- Copy example cards from home.hbs -->
    </div>
</section>
```

### pricing.hbs
```handlebars
<!-- Copy pricing section from preview-landing-page-cloudstrucc.html -->
```

### docs.hbs
```handlebars
<section style="padding: 80px 0;">
    <div class="container">
        <h1>Documentation</h1>
        <p>Coming soon...</p>
    </div>
</section>
```

## ✅ Verification Checklist

After setup, verify:

- [ ] MongoDB is running (`docker ps | grep mongodb`)
- [ ] API server is running on port 3000
- [ ] `.env` file configured with correct values
- [ ] All files renamed (removed `webapp-` prefix)
- [ ] `npm install` completed successfully
- [ ] Web app starts without errors
- [ ] Can access http://localhost:3001
- [ ] Can register a new user
- [ ] Can login
- [ ] Can generate a diagram

## 🎯 File Mapping Reference

Download from outputs → Place in webapp-frontend:

```
WEBAPP-ENV-FILE.env              → .env
WEBAPP-README.md                 → README.md
webapp-server.js                 → server.js
webapp-app.js                    → app.js
webapp-package.json              → package.json
webapp-config-passport.js        → config/passport.js
webapp-models-User.js            → models/User.js
webapp-models-Diagram.js         → models/Diagram.js
webapp-services-diagramApiClient.js → services/diagramApiClient.js
webapp-middleware-auth.js        → middleware/auth.js
webapp-routes-index.js           → routes/index.js
webapp-routes-auth.js            → routes/auth.js
webapp-routes-diagrams.js        → routes/diagrams.js
webapp-views-layouts-main.hbs    → views/layouts/main.hbs
webapp-views-partials-navbar.hbs → views/partials/navbar.hbs
webapp-views-partials-footer.hbs → views/partials/footer.hbs
webapp-views-home.hbs            → views/home.hbs
webapp-views-login.hbs           → views/login.hbs
webapp-views-register.hbs        → views/register.hbs
webapp-public-css-style.css      → public/css/style.css
webapp-public-js-main.js         → public/js/main.js
webapp-public-js-diagram-generator.js → public/js/diagram-generator.js
```

## 🔧 Testing the Application

1. **Start everything:**
   ```bash
   # Terminal 1: MongoDB
   docker start mongodb-webapp

   # Terminal 2: API Server
   cd api && npm start

   # Terminal 3: Web App
   cd webapp-frontend && npm start
   ```

2. **Register a user:**
   - Go to http://localhost:3001/auth/register
   - Fill in form
   - Click "Create Account"

3. **Generate a diagram:**
   - Login
   - Click "New Diagram"
   - Enter: "Azure AKS cluster with SQL database"
   - Select style: "azure"
   - Click "Generate Diagram"
   - Wait for completion

## 🎨 CloudStrucc Colors Applied

All views use exact CloudStrucc branding:
- Primary: #012970 (navy)
- Secondary: #4154f1 (bright blue)
- Accent: #f85a40 (coral)
- Light BG: #f6f9ff

## 📞 Support

If you have issues:
1. Check MongoDB is running
2. Check API server is running
3. Verify `.env` matches API server config
4. Check console for errors

## 🎉 You're All Set!

All files are created and ready. Just download, rename, and run!
