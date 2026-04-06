const { getUserById } = require('../services/userService');
const { verifyToken } = require('../services/tokenService');

async function authContext(req, res, next) {
  const authHeader = req.header('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header',
    });
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({error: 'Invalid or expired token'});
  }

  try {
    const userId = payload.sub;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({error: 'Unauthorized access'});
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Inactive users cannot access this resource',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = authContext;
