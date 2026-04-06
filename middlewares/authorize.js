function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({error: 'Authentication required'});
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({error: `Insufficient permissions. Allowed roles: ${allowedRoles.join(', ')}`});
    }

    return next();
  };
}

module.exports = authorize;
