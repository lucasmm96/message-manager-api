const Message = require('../models/message');
const pendingUserList = require('../models/pending-user');
const pendingMessageList = require('../models/pendingMessage/actions/list');
const codeStatusHandler = require('../util/javascript/codeStatus');

exports.getPendingUserList = async (req, res) => {
  try {
    const data = await pendingUserList.find();
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
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
