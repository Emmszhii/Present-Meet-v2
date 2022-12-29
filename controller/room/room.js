const roomPage = (req, res) => {
  const { meetingId } = req.query;
  if (!meetingId) return res.redirect('*');
  return res.render('room');
};

const quitRoom = (req, res) => {
  res.redirect('/');
};

module.exports = { roomPage, quitRoom };
