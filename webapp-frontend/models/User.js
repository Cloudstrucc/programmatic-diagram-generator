// models/User.js - User Model
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    enum: ['free', 'standard', 'pro'],
    default: 'free'
  },
  diagramsCreated: {
    type: Number,
    default: 0
  },
  diagramsToday: {
    type: Number,
    default: 0
  },
  lastDiagramDate: {
    type: Date,
    default: null
  },
  jwtToken: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Reset daily diagram count
UserSchema.methods.resetDailyCount = function() {
  const today = new Date().toDateString();
  const lastDate = this.lastDiagramDate ? new Date(this.lastDiagramDate).toDateString() : null;
  
  if (today !== lastDate) {
    this.diagramsToday = 0;
    this.lastDiagramDate = new Date();
  }
};

// Get tier limits
UserSchema.methods.getTierLimits = function() {
  const limits = {
    free: { diagramsPerDay: 10, quality: 'standard', apiAccess: false },
    standard: { diagramsPerDay: 100, quality: 'enterprise', apiAccess: true },
    pro: { diagramsPerDay: 500, quality: 'enterprise', apiAccess: true }
  };
  return limits[this.tier];
};

// Check if user can create diagram
UserSchema.methods.canCreateDiagram = function() {
  this.resetDailyCount();
  const limits = this.getTierLimits();
  return this.diagramsToday < limits.diagramsPerDay;
};

module.exports = mongoose.model('User', UserSchema);
