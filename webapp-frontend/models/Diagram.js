// models/Diagram.js - Diagram Model
const mongoose = require('mongoose');

const DiagramSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  prompt: {
    type: String,
    required: true
  },
  diagramType: {
    type: String,
    enum: ['drawio', 'python'],
    required: true
  },
  style: {
    type: String,
    default: 'azure'
  },
  quality: {
    type: String,
    enum: ['simple', 'standard', 'enterprise'],
    default: 'standard'
  },
  template: {
    type: String,
    default: null
  },
  imageData: {
    type: String, // Base64 encoded image for python diagrams
    default: null
  },
  xmlData: {
    type: String, // XML for drawio diagrams
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  requestId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  error: {
    type: String,
    default: null
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  favorite: {
    type: Boolean,
    default: false
  },
  requestId: {
    type: String,
    index: true
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
DiagramSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
DiagramSchema.index({ user: 1, createdAt: -1 });
DiagramSchema.index({ user: 1, favorite: 1 });

module.exports = mongoose.model('Diagram', DiagramSchema);
