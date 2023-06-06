const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.postSignup = async function (req, res) {
  let existingUser;
  try {
    existingUser = await User.findOne({ email: req.body.email });
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  if (existingUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'This email is already registered.',
    });
    return;
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    admin: req.body.admin,
  });

  try {
    await newUser.save();
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.TOKEN_KEY,
      { expiresIn: '1h' }
    );
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  res.status(200).json({
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    admin: newUser.admin,
    token: token,
  });
};

exports.postLogin = async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  if (!existingUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'Invalid credentials',
    });
    return;
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  if (!isValidPassword) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'Invalid credentials',
    });
    return;
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        admin: existingUser.admin,
      },
      process.env.TOKEN_KEY,
      { expiresIn: '1h' }
    );
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  res.status(200).json({
    id: existingUser.id,
    username: existingUser.username,
    email: existingUser.email,
    admin: existingUser.admin,
    token: token,
  });
};
