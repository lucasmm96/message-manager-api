const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.method == 'OPTIONS') {
    return next();
  }

  try {
    let token = req.headers.authorization;
    if (!token) throw new Error('Authentication failed.');
    token = token.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
    if (!decodedToken) throw new Error('Invalid token.');
    req.userData = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      admin: decodedToken.admin,
    };
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: 'The request has failed.', error: error.message });
  }
};
