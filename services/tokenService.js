const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET ;
const expiresIn = process.env.JWT_EXPIRES_IN;

function signToken(user) {
  const payload = {sub: user.id,role: user.role,email: user.email,};
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
