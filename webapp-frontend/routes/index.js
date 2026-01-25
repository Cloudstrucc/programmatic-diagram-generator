// routes/index.js - Main Routes
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Landing Page
router.get('/', (req, res) => {
  res.render('home', {
    title: 'AI-Powered Architecture Diagrams - CloudStrucc',
    layout: 'main',
    hideNavAuth: true // Show "Get Started" instead of user menu
  });
});

// Features Page
router.get('/features', (req, res) => {
  res.render('features', {
    title: 'Features - CloudStrucc Diagrams',
    layout: 'main'
  });
});

// Examples Page
router.get('/examples', (req, res) => {
  res.render('examples', {
    title: 'Examples - CloudStrucc Diagrams',
    layout: 'main'
  });
});

// Pricing Page
router.get('/pricing', (req, res) => {
  res.render('pricing', {
    title: 'Pricing - CloudStrucc Diagrams',
    layout: 'main'
  });
});

// Dashboard (Protected)
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const Diagram = require('../models/Diagram');
    
    // Get user's recent diagrams
    const recentDiagrams = await Diagram.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(6);

    // Get statistics
    const totalDiagrams = await Diagram.countDocuments({ user: req.user._id });
    const completedDiagrams = await Diagram.countDocuments({ 
      user: req.user._id, 
      status: 'completed' 
    });

    // Reset daily count if needed
    req.user.resetDailyCount();
    await req.user.save();

    const limits = req.user.getTierLimits();

    res.render('dashboard', {
      title: 'Dashboard - CloudStrucc Diagrams',
      layout: 'main',
      user: req.user,
      recentDiagrams,
      stats: {
        total: totalDiagrams,
        completed: completedDiagrams,
        today: req.user.diagramsToday,
        limit: limits.diagramsPerDay,
        remaining: limits.diagramsPerDay - req.user.diagramsToday
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
});

// Documentation
router.get('/docs', (req, res) => {
  res.render('docs', {
    title: 'Documentation - CloudStrucc Diagrams',
    layout: 'main'
  });
});

module.exports = router;
