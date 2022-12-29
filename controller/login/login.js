const passport = require('passport');

const checkAttempts = (req, res, next) => {
  req.session.loginAttempts++;
  const { rememberMe } = req.body;
  const oneDay = 1000 * 60 * 60 * 24;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  rememberMe
    ? (req.session.rememberMe = oneWeek)
    : (req.session.rememberMe = oneDay);
  const attempts = req.session.loginAttempts;
  if (attempts > 3) {
    req.session.loginAttempts = 0;
    return res.redirect('/forgot-password');
  }
  next();
}; // count login attempts

const checkLogin = async (req, res, next) => {
  req.isAuthenticated() ? res.redirect('/') : res.render('login');
}; // if user login redirect to home

const userAuth = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  keepSessionInfo: true,
}); // if login attempt failed retry

const successAuth = (req, res) => {
  let redirectTo = `/`;
  if (req.session.reqUrl) {
    redirectTo = req.session.reqUrl;
    req.session.reqUrl = null;
  }
  res.redirect(redirectTo);
};

module.exports = { userAuth, checkAttempts, checkLogin, successAuth };
