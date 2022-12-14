const sgMail = require('@sendgrid/mail');

const forgotPasswordMail = async (email, code) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  try {
    const msg = {
      to: email,
      from: `presentmeet@gmail.com`,
      subject: `Forgot Password <DO NOT REPLY>`,
      text: `Hi, Good day here's your code to change your password ${code}`,
      html: `Hi, Good day here's your code to change your password
      \n<h1><code><b>${code}</b></code></h1>\n`,
    };

    sgMail
      .send(msg)
      .then(() => console.log(`Email send to ${email}`))
      .catch((e) => console.error(e));
  } catch (e) {
    console.log(e);
    return { err: `Something went wrong` };
  }
};

module.exports = { forgotPasswordMail };
