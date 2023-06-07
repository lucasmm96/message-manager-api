const PendingUser = require('../models/pending-user');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.postSignup = async function (req, res) {
  const existingUser = await User.findOne({ email: req.body.email });
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

  const newPendingUser = new PendingUser({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    admin: req.body.admin,
  });

  try {
    await newPendingUser.save();
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: newPendingUser.id,
        username: newPendingUser.username,
        email: newPendingUser.email,
        password: newPendingUser.password,
        admin: newPendingUser.admin,
      },
      process.env.TOKEN_KEY,
      { expiresIn: '1h' }
    );
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
    return;
  }

  res.status(200).json({
    id: newPendingUser.id,
    action: newPendingUser.action,
    status: newPendingUser.status,
    username: newPendingUser.username,
    email: newPendingUser.email,
    admin: newPendingUser.admin,
    token: token,
  });
};

exports.postApproveUser = async function (req, res) {
  const id = req.body.id;

  const pendingUser = await PendingUser.findById(id);
  if (!pendingUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'The user was not found.',
    });
    return;
  }

  const existingUser = await User.findOne({ email: pendingUser._doc.email });
  if (existingUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'This email is already registered.',
    });
    return;
  }

  const newUser = new User(pendingUser._doc);
  await newUser.save();

  const filter = { _id: id, status: 'Pending' };
  const update = { status: 'Accepted' };
  const options = { new: true };

  const updatedUser = await PendingUser.findByIdAndUpdate(
    filter,
    update,
    options
  );

  if (!updatedUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'User not found or already accepted.',
    });
    return;
  }

  return res.status(200).json({
    message: 'The request has been received.',
    result: newUser,
  });
};

exports.postRejectUser = async function (req, res) {
  const id = req.body.id;
  const filter = { _id: id, status: 'Pending' };
  const update = { status: 'Rejected' };
  const options = { new: true };

  const updatedUser = await PendingUser.findByIdAndUpdate(
    filter,
    update,
    options
  );

  if (!updatedUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'User not found.',
    });
    return;
  }

  return res.status(200).json({
    message: 'The request has been received.',
    result: updatedUser._doc,
  });
};

exports.postRemoveUser = async function (req, res) {
  const id = req.body.id;
  const existingUser = await User.findById(id);
  if (!existingUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'User was not found.',
    });
    return;
  }

  const newPendingUser = new PendingUser({
    action: 'Delete',
    status: 'Accepted',
    username: existingUser._doc.username,
    email: existingUser._doc.email,
    password: existingUser._doc.password,
    admin: existingUser._doc.admin,
  });
  newPendingUser.save();

  const deletedUser = await User.findByIdAndRemove(id, { new: true });
  if (!deletedUser) {
    res.status(400).json({
      message: 'The request has failed.',
      error: 'User was not found.',
    });
    return;
  }

  return res.status(200).json({
    message: 'The request has been received.',
    result: existingUser._doc,
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
