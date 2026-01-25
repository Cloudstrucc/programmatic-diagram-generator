// middleware/auth.js - Authentication Middleware
module.exports = {
  // Ensure user is authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/login');
  },

  // Ensure user is NOT authenticated (for login/register pages)
  ensureGuest: function(req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    } else {
      return next();
    }
  },

  // Check user tier
  ensureTier: function(minTier) {
    const tierLevels = { free: 1, standard: 2, pro: 3 };
    
    return function(req, res, next) {
      if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Please log in to view this resource');
        return res.redirect('/login');
      }

      const userLevel = tierLevels[req.user.tier];
      const requiredLevel = tierLevels[minTier];

      if (userLevel >= requiredLevel) {
        return next();
      } else {
        req.flash('error_msg', `This feature requires ${minTier} tier or higher`);
        res.redirect('/dashboard');
      }
    };
  }
};
