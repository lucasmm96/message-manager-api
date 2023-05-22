module.exports = (req, res, next) => {
  if (!Array.isArray(req.body)) {
    return res
      .status(400)
      .json({ message: 'The request body must be an array.' });
  }
  next();
};
