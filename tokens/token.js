const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { RtmTokenBuilder, RtmRole } = require('agora-access-token');

const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
};

const rtc_token = (channel, acc_id) => {
  // resp.header('Access-Control-Allow-Origin', '*');
  const channelName = channel;
  console.log(channelName);
  if (!channelName) {
    return resp.status(500).json({ error: 'channel is required' });
  }
  let id = acc_id;
  console.log(id);
  if (!id || id === '') {
    return resp.status(500).json({ error: 'id is required' });
  }
  // get role
  let role = RtcRole.PUBLISHER;
  // if (req.params.role === 'publisher') {
  //   role = RtcRole.PUBLISHER;
  // } else if (req.params.role === 'audience') {
  //   role = RtcRole.SUBSCRIBER;
  // } else {
  //   return resp.status(500).json({ error: 'role is incorrect' });
  // }
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithAccount(
    process.env.AGORA_APP_ID,
    process.env.AGORA_APP_CERTIFICATE,
    channelName,
    id,
    role,
    privilegeExpireTime
  );
  return resp.json({
    rtcToken: token,
  });
};

// GENERATE RTM TOKEN
const rtm_token = (acc_id) => {
  // set response header
  // resp.header('Access-Control-Allow-Origin', '*');

  // get uid
  const uid = acc_id;
  if (!uid || uid === '') {
    return resp.status(500).json({ error: 'uid is required' });
  }
  // get role
  const role = RtmRole.Rtm_User;
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const APP_ID = process.env.AGORA_APP_ID;
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ rtmToken: token });
};

const token = (channel, acc_id) => {
  const rtc = rtc_token(channel, acc_id);
  const rtm = rtm_token(acc_id);

  return res.json({ rtc, rtm });
};

module.export = { token };
