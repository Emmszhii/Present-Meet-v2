const homePage = (req, res) => {
  const type = req.user.type;
  const firstName = req.user.first_name;
  const lastName = req.user.last_name;
  res.render('home', { type, firstName, lastName });
};

const getBasicInfo = async (req, res) => {
  const { _id, first_name, middle_name, last_name, type } = req.user;
  return res.status(200).json({
    _id,
    first_name,
    middle_name,
    last_name,
    type,
    AGORA_APP_ID: process.env.AGORA_APP_ID,
  });
};

module.exports = { homePage, getBasicInfo };
