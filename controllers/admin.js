const pendingMessage = require('../models/pendingMessage/pending-message');
const Message = require('../models/message');
const pendingUserList = require('../models/pending-user');
const User = require('../models/user');

const similarity = require('../util/similarity');
const codeStatusHandler = require('../util/codeStatus');

exports.getPendingMessageList = async (req, res) => {
  try {
    const data = await pendingMessage.aggregate([
      {
        $addFields: {
          statusPriority: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'Pending'] }, then: 1 },
                { case: { $eq: ['$status', 'Rejected'] }, then: 2 },
                { case: { $eq: ['$status', 'Accepted'] }, then: 3 },
              ],
              default: 4,
            },
          },
          typePriority: {
            $switch: {
              branches: [
                { case: { $eq: ['$type', 'Approval'] }, then: 1 },
                { case: { $eq: ['$type', 'Backup'] }, then: 2 },
              ],
              default: 3,
            },
          },
        },
      },
      {
        $sort: {
          requestedAt: -1,
          statusPriority: 1,
          typePriority: 1,
        },
      },
    ]);
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error.message });
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

exports.postApproveAddMessage = async (req, res) => {
  const messageList = req.body;
  const successInsert = [];
  const failedInsert = [];

  try {
    for (const messageItem of messageList) {
      const filter = {
        _id: messageItem.id,
        action: 'Add',
        status: { $ne: 'Accepted' },
      };
      const addRequest = await pendingMessage.find(filter);
      if (addRequest.length === 0) {
        failedInsert.push(messageItem);
      } else {
        const { isSimilar, data } = await similarity({ ...messageItem.data });
        if (isSimilar) {
          failedInsert.push({ message: messageItem.data, similarity: data });
        } else {
          const newMessage = new Message(addRequest[0]._doc.data);
          await newMessage.save();
          await pendingMessage.findOneAndUpdate(filter, { status: 'Accepted' });
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

exports.postApproveUpdateMessage = async (req, res) => {
  const messageList = req.body;
  const successUpdate = [];
  const failedUpdate = [];

  try {
    for (const messageItem of messageList) {
      const filter = {
        _id: messageItem.id,
        action: 'Update',
        status: { $ne: 'Accepted' },
      };
      const updateRequest = await pendingMessage.find(filter);
      if (updateRequest.length === 0) {
        failedUpdate.push(messageItem);
      } else {
        const updateRequestData = updateRequest[0]._doc.data;
        const fullData = await Message.find()
          .where('_id')
          .ne(updateRequestData.id);
        const { isSimilar, data } = await similarity(fullData, {
          ...updateRequestData.new,
        });
        if (isSimilar) {
          failedUpdate.push({ message: messageItem.data, similarity: data });
        } else {
          await Message.findByIdAndUpdate(
            updateRequestData.id,
            updateRequestData.new
          );
          await pendingMessage.findOneAndUpdate(filter, { status: 'Accepted' });
          successUpdate.push(messageItem);
        }
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

exports.postApproveDeleteMessage = async (req, res) => {
  const messageList = req.body;
  const successDelete = [];
  const failedDelete = [];

  try {
    for (const messageItem of messageList) {
      const filter = {
        _id: messageItem.id,
        action: 'Delete',
        status: { $ne: 'Accepted' },
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

exports.postRejectMessage = async (req, res) => {
  const messageList = req.body;
  const successReject = [];
  const failedReject = [];

  try {
    for (const messageItem of messageList) {
      const filter = { _id: messageItem.id, status: { $ne: 'Accepted' } };
      const pendingRequest = await pendingMessage.find(filter);
      if (pendingRequest.length === 0) {
        failedReject.push(messageItem);
      } else {
        await pendingMessage.findOneAndUpdate(filter, { status: 'Rejected' });
        successReject.push(messageItem);
      }
    }
    const codeStatus = codeStatusHandler(successReject, failedReject);
    return res.status(codeStatus).json({
      message: 'The request has been received.',
      result: { success: successReject, failed: failedReject },
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
