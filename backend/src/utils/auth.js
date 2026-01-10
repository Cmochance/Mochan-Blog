const jwt = require('jsonwebtoken');
const { getRequiredEnv } = require('./env');

function signToken(user) {
  const secret = getRequiredEnv('JWT_SECRET');
  return jwt.sign({ user }, secret, {
    expiresIn: process.env.TOKEN_EXPIRES_IN || '7d'
  });
}

function getTokenFromRequest(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  try {
    const secret = getRequiredEnv('JWT_SECRET');
    const payload = jwt.verify(token, secret);
    req.user = payload.user || null;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '登录已过期' });
  }
}

module.exports = {
  signToken,
  getTokenFromRequest,
  requireAuth
};
