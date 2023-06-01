const pendingMessageList = require('../models/pendingMessage/actions/list');
const pendingUserList = require('../models/pending-user');
const Message = require('../models/message');
const User = require('../models/user');
const codeStatusHandler = require('../util/javascript/codeStatus');

exports.getPendingUserList = async (req, res) => {
  try {
    const data = await pendingUserList.find();
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};

exports.getUserList = async (req, res) => {
  try {
    const data = await User.find();
    const formattedData = data.map((item) => ({
      _id: item._id,
      username: item.username,
      email: item.email,
      admin: item.admin,
    }));
    return res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    const formattedData = {
      _id: user._doc._id,
      username: user._doc.username,
      email: user._doc.email,
      admin: user._doc.admin,
    };
    if (user) {
      return res.status(200).json({
        message: 'The request has been received.',
        result: formattedData,
      });
    } else {
      throw Error('User was not found.');
    }
  } catch (error) {
    return res.status(500).json({
      message: 'The request has failed.',
      error: error.message || error,
    });
  }
};

exports.getPendingMessageList = async (req, res) => {
  try {
    const data = await pendingMessageList.find();
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};

exports.getPendingMessageById = async (req, res) => {
  const messageId = req.params.messageId;
  try {
    const message = await pendingMessageList.findById(messageId);

    if (message) {
      return res.status(200).json({
        message: 'The request has been received.',
        result: message,
      });
    } else {
      throw Error('Message was not found.');
    }
  } catch (error) {
    return res.status(500).json({
      message: 'The request has failed.',
      error: error.message || error,
    });
  }
};

exports.getPendingUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await pendingUserList.findById(userId);
    const formattedData = {
      _id: user._doc._id,
      username: user._doc.username,
      email: user._doc.email,
      admin: user._doc.admin,
    };
    if (user) {
      return res.status(200).json({
        message: 'The request has been received.',
        result: formattedData,
      });
    } else {
      throw Error('User was not found.');
    }
  } catch (error) {
    return res.status(500).json({
      message: 'The request has failed.',
      error: error.message || error,
    });
  }
};

exports.postAddMessage = async (req, res) => {
  const messages = req.body;
  const successInsert = [];
  const failedInsert = [];

  try {
    await Promise.all(
      messages.map(async (messageItem) => {
        const message = await pendingMessageList.findById(messageItem.id);
        if (!message) {
          failedInsert.push(messageItem.id);
        } else {
          const newMessage = new Message({ ...message.data });
          await newMessage.save();
          const updatedMessage = await pendingMessageList.findOneAndUpdate(
            { _id: messageItem.id, status: { $ne: 'Closed' } },
            { status: messageItem.status },
            { new: true }
          );
          if (!updatedMessage) {
            failedInsert.push(messageItem.id);
          } else {
            successInsert.push(message);
          }
        }
      })
    );

    const codeStatus = codeStatusHandler(successInsert, failedInsert);

    return res.status(codeStatus).json({
      message: 'The request has been received.',
      result: { success: successInsert, failed: failedInsert },
    });
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};
