// Protect routes from unauthenticated users
exports.ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    res.redirect('/login');
  };
  
  // Only allow admin users
exports.ensureAdmin = (req, res, next) => {
    if (req.session?.user?.role === 'admin') {
        return next();
    }
    res.status(403).send('Access denied. Admins only.');
};


  