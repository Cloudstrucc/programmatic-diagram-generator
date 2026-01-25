// routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureGuest } = require('../middleware/auth');
const User = require('../models/User');

// Login Page
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    title: 'Login - CloudStrucc Diagrams',
    layout: 'main'
  });
});

// Register Page
router.get('/register', ensureGuest, (req, res) => {
  res.render('register', {
    title: 'Register - CloudStrucc Diagrams',
    layout: 'main'
  });
});

// Register Handle
router.post('/register', ensureGuest, async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Validation
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.render('register', {
      title: 'Register - CloudStrucc Diagrams',
      layout: 'main',
      errors,
      name,
      email
    });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('register', {
        title: 'Register - CloudStrucc Diagrams',
        layout: 'main',
        errors,
        name,
        email
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save user
    await newUser.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/auth/register');
  }
});

// Login Handle
router.post('/login', ensureGuest, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
});

module.exports = router;
