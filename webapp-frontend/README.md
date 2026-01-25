# CloudStrucc Diagram Generator - Web Frontend

Professional web application for AI-powered architecture diagram generation with CloudStrucc branding.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue)](https://expressjs.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple)](https://getbootstrap.com)

## 🎨 Features

- **CloudStrucc Branding** - Exact colors and styling from cloudstrucc.com
- **User Authentication** - Passport.js with local strategy (username/password)
- **Tier System** - Free (10/day), Standard (100/day), Pro (500/day)
- **API Integration** - Full connection to diagram generation API
- **Diagram Management** - Create, view, favorite, delete diagrams
- **Real-time Generation** - Live status updates during diagram creation
- **Responsive Design** - Bootstrap 5, mobile-friendly
- **Secure Sessions** - Express session with MongoDB store

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **MongoDB** 5+ (Local or Docker)
- **Diagram API Server** running on port 3000

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Required Configuration:**
- `MONGODB_URI` - Your MongoDB connection string
- `API_URL` - Your diagram API server URL (default: http://localhost:3000)
- `API_JWT_SECRET` - Must match your API server's JWT secret
- `SESSION_SECRET` - Random string for session encryption

### 3. Start MongoDB

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb-webapp mongo:latest
```

**Using Homebrew (macOS):**
```bash
brew services start mongodb-community
```

### 4. Start Diagram API Server

```bash
# In another terminal, navigate to API directory
cd ../api
npm start

# API should be running on http://localhost:3000
```

### 5. Start Web Application

```bash
npm start
```

**Expected Output:**
```
✓ MongoDB connected
╔════════════════════════════════════════════════════════════╗
║  CloudStrucc Diagram Generator - Web Application          ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on http://localhost:3001
✓ API Server: http://localhost:3000

Routes:
  GET    /              - Landing page
  GET    /login         - Login page
  GET    /register      - Registration page
  GET    /dashboard     - User dashboard
  GET    /generator     - Diagram generator
  GET    /my-diagrams   - User diagrams
```

### 6. Access Application

Open your browser and visit: **http://localhost:3001**

## 🏗️ Project Structure

```
webapp-frontend/
├── server.js                 # Application entry point
├── app.js                    # Express configuration
├── package.json              # Dependencies
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
│
├── config/
│   └── passport.js           # Passport authentication strategy
│
├── models/
│   ├── User.js               # User model with tier system
│   └── Diagram.js            # Diagram storage model
│
├── middleware/
│   └── auth.js               # Authentication middleware
│
├── services/
│   └── diagramApiClient.js   # API client for diagram generation
│
├── routes/
│   ├── index.js              # Main routes (home, dashboard)
│   ├── auth.js               # Authentication routes
│   └── diagrams.js           # Diagram CRUD routes
│
├── controllers/              # (Optional - logic in routes for simplicity)
│
├── views/
│   ├── layouts/
│   │   └── main.hbs          # Main layout template
│   ├── partials/
│   │   ├── navbar.hbs        # Navigation bar
│   │   └── footer.hbs        # Footer
│   ├── home.hbs              # Landing page
│   ├── login.hbs             # Login page
│   ├── register.hbs          # Registration page
│   ├── dashboard.hbs         # User dashboard
│   ├── generator.hbs         # Diagram generator
│   ├── my-diagrams.hbs       # User's diagrams
│   ├── view-diagram.hbs      # Single diagram view
│   ├── examples.hbs          # Examples page
│   ├── pricing.hbs           # Pricing page
│   └── docs.hbs              # Documentation
│
└── public/
    ├── css/
    │   └── style.css         # CloudStrucc styling
    ├── js/
    │   ├── main.js           # Main JavaScript
    │   └── diagram-generator.js  # Generator page logic
    └── images/
        └── (logo, icons, etc.)
```

## 🎯 User Tiers

| Tier | Diagrams/Day | Quality | API Access | Price |
|------|-------------|---------|------------|-------|
| **Free** | 10 | Standard | ❌ | $0 |
| **Standard** | 100 | Enterprise | ✅ | $29/mo |
| **Pro** | 500 | Enterprise | ✅ | $99/mo |

## 🔐 Authentication Flow

1. User registers with email/password
2. Password hashed with bcrypt (10 salt rounds)
3. User logs in with Passport.js local strategy
4. Session stored in MongoDB
5. JWT token generated for API calls
6. Tier-based rate limiting enforced

## 🎨 CloudStrucc Brand Colors

```css
--primary-color: #012970;    /* Deep navy blue */
--secondary-color: #4154f1;  /* Bright blue */
--accent-color: #f85a40;     /* Coral orange */
--light-bg: #f6f9ff;         /* Light blue background */
--text-color: #444444;       /* Body text */
--heading-color: #012970;    /* Headings */
```

## 📡 API Integration

The web app connects to your diagram API for generation:

**Endpoints Used:**
- `POST /api/diagram/generate` - Generate new diagram
- `GET /api/diagram/status/:id` - Check generation status
- `GET /api/diagram/templates` - Get available templates
- `GET /api/diagram/python/styles` - Get diagram styles
- `GET /api/diagram/usage` - Get usage statistics

**Authentication:**
- JWT tokens generated using `API_JWT_SECRET`
- Tokens include user email and tier
- 24-hour expiration

## 🧪 Testing

### Test User Registration

```bash
# Open http://localhost:3001/auth/register
# Register with:
- Name: Test User
- Email: test@example.com
- Password: password123
```

### Test Diagram Generation

```bash
# 1. Login with test user
# 2. Navigate to /diagrams/generator
# 3. Enter prompt: "Azure AKS cluster with SQL database"
# 4. Select style: "azure"
# 5. Select quality: "enterprise"
# 6. Click "Generate Diagram"
```

### Test API Connection

```bash
# Check if API is accessible
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb-webapp mongo:latest

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### API Connection Failed

```bash
# Verify API is running
curl http://localhost:3000/health

# Check API_URL in .env
cat .env | grep API_URL

# Ensure API_JWT_SECRET matches API server
cat .env | grep API_JWT_SECRET
cat ../api/.env | grep JWT_SECRET
```

### Session Errors

```bash
# Generate new session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update SESSION_SECRET in .env
```

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env
echo "PORT=3002" >> .env
```

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET`
- [ ] Use MongoDB Atlas or managed database
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie options
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update `API_URL` to production API

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/diagram-app
SESSION_SECRET=your-production-secret-minimum-32-characters
API_URL=https://api.yourdomain.com
API_JWT_SECRET=your-production-api-secret
ENABLE_EMAIL_VERIFICATION=true
```

### Deployment Platforms

**Heroku:**
```bash
heroku create cloudstrucc-diagrams
heroku addons:create mongolab
heroku config:set SESSION_SECRET=your-secret
git push heroku main
```

**AWS/Azure/GCP:**
- Deploy as containerized application
- Use managed MongoDB service
- Configure load balancer
- Set up auto-scaling

## 📝 Development

### Adding New Routes

1. Create route file in `routes/`
2. Add to `app.js`:
   ```javascript
   app.use('/your-route', require('./routes/your-route'));
   ```

### Adding New Views

1. Create `.hbs` file in `views/`
2. Use Handlebars syntax with layout:
   ```handlebars
   <section>
       <h1>{{title}}</h1>
       <p>{{content}}</p>
   </section>
   ```

### Handlebars Helpers

Available helpers in `app.js`:
- `formatDate` - Format dates
- `truncate` - Truncate text
- `json` - JSON.stringify
- `eq` - Equality check
- `ifCond` - Conditional rendering

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file

## 💬 Support

- **Issues**: GitHub Issues
- **Email**: contact-us@cloudstrucc.com
- **Website**: https://www.cloudstrucc.com

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com)
- Styled with [Bootstrap 5](https://getbootstrap.com)
- Templates with [Handlebars](https://handlebarsjs.com)
- Authentication with [Passport.js](http://www.passportjs.org)
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com)

---

**Built with ❤️ by CloudStrucc Inc.**
