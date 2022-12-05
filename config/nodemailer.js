const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: `OAuth2`,
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.MAIL_OAUTH_CLIENTID,
    clientSecret: process.env.MAIL_OAUTH_CLIENT_SECRET,
    refreshToken: process.env.MAIL_OAUTH_REFRESH_TOKEN,
  },
});

const forgotPasswordMail = async (email, otp) => {
  const mailOptions = {
    from: `"Present Meet Company" "<no-reply@presentmeet.com>"`,
    to: email,
    subject: 'Present Meet Forgot Password: DO NOT REPLY',
    text: `Hi, Good day here's your otp to change your password ${otp}`,
    html: `Hi, Good day here's your otp to change your password \n<code><b>${otp}</b></code>\n`,
  };
  let err;
  try {
    await transporter.sendMail(mailOptions);
    return;
  } catch (e) {
    console.log(e);
    return (err = `Invalid Request`);
  }
};

module.exports = { forgotPasswordMail };
