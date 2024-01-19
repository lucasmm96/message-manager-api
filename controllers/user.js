const pendingMessageAdd = require('../models/pendingMessage/actions/add');
const pendingMessageUpdate = require('../models/pendingMessage/actions/update');
const pendingMessageDelete = require('../models/pendingMessage/actions/delete');
const pendingMessage = require('../models/pendingMessage/pending-message');
const Message = require('../models/message');

const similarity = require('../util/similarity');
const formatDate = require('../util/formatDate');
const lastPostDate = require('../util/lastPostDate');
const codeStatusHandler = require('../util/codeStatus');

exports.getMessageList = async (req, res) => {
  try {
    const { size, skip } = req.query;
    const data = await Message.aggregate([
      { $sort: { postedAt: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(size) },
    ]);

    const formattedData = data.map((item) => ({
      ...item,
      addedAt: formatDate(item.addedAt),
      postedAt: formatDate(item.postedAt),
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error.message });
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
          postedAt: messageItem.postedAt ? messageItem.postedAt : dayAfter,
        };
        const addRequest = new pendingMessageAdd({
          requesterId: req.userData.userId,
          action: 'Add',
          type: req.userData.admin ? 'Backup' : 'Approval',
          status: req.userData.admin ? 'Approved' : 'Pending',
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
      const currentMessage = await Message.findById(messageItem._id);
      const currentPendingMessage = await pendingMessage.find({
        'data.id': messageItem._id,
        action: 'Update',
        status: { $ne: 'Approved' },
      });

      console.log('currentPendingMessage: ', currentPendingMessage);
      console.log('currentPendingMessage.length: ', currentPendingMessage.length);

      if (!currentMessage) {
        failedUpdate.push({ message: messageItem, error: 'Message not found.' });
      } else if (currentPendingMessage.length > 0) {
        failedUpdate.push({ message: messageItem, error: 'There is already a pending request for this record.' });
      } else {
        const fullData = await Message.find().where('_id').ne(messageItem._id);
        const { isSimilar, data } = await similarity(fullData, messageItem);

        if (isSimilar) {
          failedUpdate.push({ message: messageItem, similarity: data });
        } else {
          const newMessageData = {
            ...messageItem,
            addedAt: currentMessage._doc.addedAt,
            postedAt: messageItem.postedAt
              ? messageItem.postedAt
              : currentMessage._doc.postedAt,
          };
          const updateRequest = new pendingMessageUpdate({
            requesterId: req.userData.userId,
            action: 'Update',
            type: req.userData.admin ? 'Backup' : 'Approval',
            status: req.userData.admin ? 'Approved' : 'Pending',
            data: {
              id: messageItem._id,
              old: { ...currentMessage._doc },
              new: newMessageData,
            },
          });
          await updateRequest.save();

          if (req.userData.admin) {
            await Message.findByIdAndUpdate(messageItem._id, newMessageData);
          }

          successUpdate.push(messageItem);
        }
      }
    }
    const codeStatus = codeStatusHandler(successUpdate, failedUpdate);

    console.log({ success: successUpdate, failed: failedUpdate });

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
      const currentMessage = await Message.findById(messageItem._id);
      if (!currentMessage) {
        failedDelete.push(messageItem);
      } else {
        const currentMessageData = { ...currentMessage._doc };
        const deleteRequest = new pendingMessageDelete({
          requesterId: req.userData.userId,
          action: 'Delete',
          type: req.userData.admin ? 'Backup' : 'Approval',
          status: req.userData.admin ? 'Approved' : 'Pending',
          data: {
            id: messageItem._id,
            ...currentMessageData,
          },
        });
        await deleteRequest.save();

        if (req.userData.admin) {
          await Message.findByIdAndDelete(messageItem._id);
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
