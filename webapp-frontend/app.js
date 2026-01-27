// app.js - Express Application Configuration
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

// Security & Compression
app.use(helmet({
  contentSecurityPolicy: false // Allow CDN resources
}));
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method Override for PUT/DELETE
app.use(methodOverride('_method'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars Configuration
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    // Format date helper
    formatDate: (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    // Truncate text helper
    truncate: (str, length) => {
      if (!str || typeof str !== 'string') return '';
      if (str.length > length) {
        return str.substring(0, length) + '...';
      }
      return str;
    },
    // JSON stringify helper
    json: (context) => {
      return JSON.stringify(context);
    },
    // Equality helper
    eq: (a, b) => a === b,
    // Add helper for pagination
    add: (a, b) => a + b,
    // Conditional helper
    ifCond: (v1, operator, v2, options) => {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Session Store with better logging
console.log('📦 Creating MongoDB session store...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set ✓' : 'NOT SET ✗');

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
  connectionOptions: {
    serverSelectionTimeoutMS: 10000
  }
});

// Handle session store events
store.on('error', function(error) {
  console.error('❌ Session store error:', error);
});

store.on('connected', function() {
  console.log('✓ Session store connected to MongoDB');
});

// Session Configuration with MongoDB Store
console.log('🔐 Configuring session middleware...');
app.use(session({
  secret: process.env.SESSION_SECRET || 'cloudstrucc-diagram-generator-secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: false, // process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
  name: 'sessionId' // Custom name instead of default connect.sid
}));

console.log('✓ Session middleware configured');
console.log('Session config:', {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  name: 'sessionId',
  maxAge: '7 days'
});

// Passport Configuration
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/diagrams', require('./routes/diagrams'));

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    layout: 'main'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    layout: 'main'
  });
});

module.exports = app;