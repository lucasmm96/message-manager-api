const pendingMessageList = require('../models/pendingMessage/actions/list');
const Message = require('../models/message');
const pendingUserList = require('../models/pending-user');
const User = require('../models/user');
const codeStatusHandler = require('../util/javascript/codeStatus');

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

exports.postAddMessage = async (req, res) => {
  const messages = req.body;
  const successInsert = [];
  const failedInsert = [];

  try {
    await Promise.all(
      messages.map(async (messageItem) => {
        const message = await pendingMessageList.find({
          _id: messageItem.id,
          action: 'Add',
          status: { $ne: 'Closed' },
        });
        if (!message) {
          failedInsert.push(messageItem.id);
        } else {
          const newMessage = new Message({ ...message.data });
          await newMessage.save();
          const updatedMessage = await pendingMessageList.findOneAndUpdate(
            { _id: messageItem.id, action: 'Add', status: { $ne: 'Closed' } },
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

exports.postUpdateMessage = async (req, res) => {
  const messages = req.body;
  const successUpdate = [];
  const failedUpdate = [];

  try {
    await Promise.all(
      messages.map(async (messageItem) => {
        const pendingMessage = await pendingMessageList.find({
          _id: messageItem.id,
          action: 'Update',
          status: { $ne: 'Closed' },
        });
        if (!pendingMessage) {
          throw Error('Pending Message was not found.');
        }

        const pendingMessageData = pendingMessage[0]._doc.data;
        const updatedMessage = await Message.findByIdAndUpdate(
          pendingMessageData.id,
          pendingMessageData.new,
          { new: true }
        );
        if (!updatedMessage) {
          throw Error('Message was not found and/or updated.');
        }

        const updatedPendingMessage = await pendingMessageList.findOneAndUpdate(
          { _id: messageItem.id, action: 'Update', status: { $ne: 'Closed' } },
          { status: messageItem.status },
          { new: true }
        );
        if (!updatedPendingMessage) {
          throw Error('Pending Message was not updated.');
        }
        successUpdate.push(messageItem);

        const codeStatus = codeStatusHandler(successInsert, failedInsert);

        return res.status(codeStatus).json({
          message: 'The request has been received.',
          result: { success: successUpdate, failed: failedUpdate },
        });
      })
    );
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
