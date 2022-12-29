const userLogout = (req, res) => {
  req.logout((err) => {
    req.flash('success_msg', 'Your are logged out');
    res.redirect('/login');
  });
};

module.exports = { userLogout };
