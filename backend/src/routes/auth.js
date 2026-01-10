const express = require('express');
const jwt = require('jsonwebtoken');
const { getRequiredEnv } = require('../utils/env');
const { signToken, getTokenFromRequest } = require('../utils/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const adminUser = getRequiredEnv('ADMIN_USERNAME');
  const adminPass = getRequiredEnv('ADMIN_PASSWORD');

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  if (username === adminUser && password === adminPass) {
    const token = signToken(username);
    return res.json({ success: true, token, user: username });
  }

  return res.status(401).json({ success: false, message: '用户名或密码错误' });
});

router.get('/status', (req, res) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.json({ isLoggedIn: false, user: null });
  }

  try {
    const secret = getRequiredEnv('JWT_SECRET');
    const payload = jwt.verify(token, secret);
    return res.json({ isLoggedIn: true, user: payload.user || null });
  } catch (error) {
    return res.json({ isLoggedIn: false, user: null });
  }
});

module.exports = router;
