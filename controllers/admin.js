const pendingMessage = require('../models/pendingMessage/pending-message');
const Message = require('../models/message');
const pendingUserList = require('../models/pending-user');
const User = require('../models/user');

const isSimilar = require('../util/similarity');
const codeStatusHandler = require('../util/codeStatus');

exports.getPendingMessageList = async (req, res) => {
  try {
    const data = await pendingMessage.find();
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};

exports.getPendingMessageById = async (req, res) => {
  const messageId = req.params.messageId;
  try {
    const message = await pendingMessage.findById(messageId);

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

exports.postAddMessage = async (req, res) => {
  const messageList = req.body;
  const successInsert = [];
  const failedInsert = [];

  try {
    for (const messageItem of messageList) {
      const { status, data } = await isSimilar({ ...messageItem.data }); //TODO: mudar de "status" para "isSimilar" dentro do modulo isSimilar
      if (status) {
        failedInsert.push({ message: messageItem.data, similarity: data });
      } else {
        const filter = {
          _id: messageItem.id,
          action: 'Add',
          status: { $ne: 'Closed' },
        };
        const pendingMessage = await pendingMessage.find(filter);
        if (pendingMessage.length === 0) {
          failedInsert.push(messageItem);
        } else {
          const newMessage = new Message(pendingMessage[0]._doc.data);
          await newMessage.save();
          const update = { status: messageItem.status };
          await pendingMessage.findOneAndUpdate(filter, update);
          successInsert.push(messageItem);
        }
      }
      const codeStatus = codeStatusHandler(successInsert, failedInsert);
      return res.status(codeStatus).json({
        message: 'The request has been received.',
        result: { success: successInsert, failed: failedInsert },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'The request has failed.',
      error: error.message || error,
    });
  }
};

exports.postUpdateMessage = async (req, res) => {
  const messageList = req.body;
  const successUpdate = [];
  const failedUpdate = [];

  try {
    for (const messageItem of messageList) {
      const filter = {
        _id: messageItem.id,
        action: 'Update',
        status: { $ne: 'Closed' },
      };
      const pendingMessage = await pendingMessage.find(filter);
      if (pendingMessage.length === 0) {
        failedUpdate.push(messageItem);
      } else {
        await Message.findByIdAndUpdate(
          pendingMessage[0]._doc.data.id,
          pendingMessage[0]._doc.data.new
        );
        const update = { status: messageItem.status };
        await pendingMessage.findOneAndUpdate(filter, update);
        successUpdate.push(messageItem);
      }
    }
    const codeStatus = codeStatusHandler(successUpdate, failedUpdate);
    return res.status(codeStatus).json({
      message: 'The request has been received.',
      result: { success: successUpdate, failed: failedUpdate },
    });
  } catch (error) {
    res.status(500).json({
      message: 'The request has failed.',
      error: error.message || error,
    });
  }
};

exports.postDeleteMessage = async (req, res) => {
  const messageList = req.body;
  const successDelete = [];
  const failedDelete = [];

  try {
    for (const messageItem of messageList) {
      const filter = {
        _id: messageItem.id,
        action: 'Delete',
        status: { $ne: 'Closed' },
      };
      const pendingMessage = await pendingMessage.find(filter);
      if (pendingMessage.length === 0) {
        failedDelete.push(messageItem);
      } else {
        await Message.findByIdAndDelete(pendingMessage[0]._doc.data.id);
        successDelete.push(messageItem);
      }
    }
    const codeStatus = codeStatusHandler(successDelete, failedDelete);
    return res.status(codeStatus).json({
      message: 'The request has been received.',
      result: { success: successDelete, failed: failedDelete },
    });
  } catch (error) {
    res.status(500).json({
      message: 'The request has failed.',
      error: error.message || error,
    });
  }
};

exports.getPendingUserList = async (req, res) => {
  try {
    const data = await pendingUserList.find();
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};

exports.getPendingUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await pendingUserList.findById(userId);
    if (user) {
      const formattedData = {
        _id: user._doc._id,
        username: user._doc.username,
        email: user._doc.email,
        admin: user._doc.admin,
      };
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
    if (user) {
      const formattedData = {
        _id: user._doc._id,
        username: user._doc.username,
        email: user._doc.email,
        admin: user._doc.admin,
      };
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
