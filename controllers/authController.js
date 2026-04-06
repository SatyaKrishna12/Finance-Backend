const { validateCredentials } = require('../services/userService');
const { signToken } = require('../services/tokenService');

async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({error: 'email and password are required'});
    }

    const user = await validateCredentials(email, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'User is inactive',
      });
    }

    const accessToken = signToken(user);

    return res.status(200).json({
      data: {accessToken, tokenType: 'Bearer', user}});

  } catch (error) {
    return next(error);
  }
}

module.exports = { login };
