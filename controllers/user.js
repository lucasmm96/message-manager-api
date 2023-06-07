const pendingMessageAdd = require('../models/pendingMessage/actions/add');
const pendingMessageUpdate = require('../models/pendingMessage/actions/update');
const pendingMessageDelete = require('../models/pendingMessage/actions/delete');
const Message = require('../models/message');

const similarity = require('../util/similarity');
const formatDate = require('../util/formatDate');
const lastPostDate = require('../util/lastPostDate');
const codeStatusHandler = require('../util/codeStatus');

exports.getMessageList = async (req, res) => {
  try {
    const data = await Message.find().sort({ postedAt: -1 });
    const formattedData = data.map((item) => ({
      ...item._doc,
      addedAt: formatDate(item._doc.addedAt),
      postedAt: formatDate(item._doc.postedAt),
    }));
    return res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};

exports.getMessageById = async (req, res) => {
  const messageId = req.params.messageId;
  try {
    const message = await Message.findById(messageId);

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
      const fullData = await Message.find();
      const { isSimilar, data } = await similarity(fullData, messageItem);
      if (isSimilar) {
        failedInsert.push({ message: messageItem, similarity: data });
      } else {
        const maxPostedAt = new Date(await lastPostDate());
        const dayAfter = formatDate(
          maxPostedAt.setDate(maxPostedAt.getDate() + 1)
        );
        const messageData = {
          ...messageItem,
          addedAt: formatDate(new Date()),
          postedAt: messageItem.postedAt ? messageItem.postedAt : dayAfter,
        };
        const addRequest = new pendingMessageAdd({
          requesterId: req.userData.userId,
          action: 'Add',
          type: req.userData.admin ? 'Backup' : 'Approval',
          status: req.userData.admin ? 'Accepted' : 'Pending',
          data: messageData,
        });
        await addRequest.save();

        if (req.userData.admin) {
          const newMessage = new Message(messageData);
          await newMessage.save();
        }

        successInsert.push(messageItem);
      }
    }

    const codeStatus = codeStatusHandler(successInsert, failedInsert);

    return res.status(codeStatus).json({
      message: 'The request has been received.',
      result: { success: successInsert, failed: failedInsert },
    });
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
      const currentMessage = await Message.findById(messageItem.id);
      if (!currentMessage) {
        failedUpdate.push(messageItem);
      } else {
        const currentMessageData = { ...currentMessage._doc };
        const newMessageData = {
          ...messageItem,
          addedAt: currentMessageData.addedAt,
          postedAt: messageItem.postedAt
            ? messageItem.postedAt
            : currentMessageData.postedAt,
        };
        const updateRequest = new pendingMessageUpdate({
          requesterId: req.userData.userId,
          action: 'Update',
          type: req.userData.admin ? 'Backup' : 'Approval',
          status: req.userData.admin ? 'Accepted' : 'Pending',
          data: {
            id: messageItem.id,
            old: currentMessageData,
            new: newMessageData,
          },
        });
        await updateRequest.save();

        if (req.userData.admin) {
          await Message.findByIdAndUpdate(messageItem.id, newMessageData);
        }

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
      const currentMessage = await Message.findById(messageItem.id);
      if (!currentMessage) {
        failedDelete.push(messageItem);
      } else {
        const currentMessageData = { ...currentMessage._doc };
        const deleteRequest = new pendingMessageDelete({
          requesterId: req.userData.userId,
          action: 'Delete',
          type: req.userData.admin ? 'Backup' : 'Approval',
          status: req.userData.admin ? 'Accepted' : 'Pending',
          data: {
            id: messageItem.id,
            data: currentMessageData,
          },
        });
        await deleteRequest.save();

        if (req.userData.admin) {
          await Message.findByIdAndDelete(messageItem.id);
        }

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
