module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    const { id, token } = req.params;
    req.session.reqUrl = req.originalUrl;
    // req.flash('error', 'Please Log in to view the resource');
    res.redirect('/login');
  },
};
