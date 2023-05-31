const Message = require('../models/message');
const pendingMessageAdd = require('../models/pendingMessage/actions/add');
const pendingMessageUpdate = require('../models/pendingMessage/actions/update');
const pendingMessageDelete = require('../models/pendingMessage/actions/delete');

const isSimilar = require('../util/javascript/similarity');
const formatDate = require('../util/javascript/formatDate');
const lastPostDate = require('../util/javascript/lastPostDate');
const codeStatusHandler = require('../util/javascript/codeStatus');

exports.getMessageById = async (req, res) => {
  const messagesId = req.body;
  const sucessSearch = [];
  const failedSearch = [];

  await Promise.all(
    messagesId.map(async (messageId) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          sucessSearch.push(message);
        } else {
          failedSearch.push(messageId);
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: 'The request has failed.', error: error });
      }
    })
  );

  const codeStatus = codeStatusHandler(sucessSearch, failedSearch);

  return res.status(codeStatus).json({
    message: 'The request has been received.',
    result: { success: sucessSearch, failed: failedSearch },
  });
};

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

exports.postAddMessage = async (req, res) => {
  const messages = req.body;
  const successInsert = [];
  const failedInsert = [];

  try {
    await Promise.all(
      messages.map(async (messageItem) => {
        const { status, data } = await isSimilar(messageItem);
        if (status) {
          failedInsert.push({ message: messageItem, similarity: data });
        } else {
          const maxPostedAt = new Date(await lastPostDate());
          const dayAfter = formatDate(
            maxPostedAt.setDate(maxPostedAt.getDate() + 1)
          );
          const message = {
            ...messageItem,
            data: {
              ...messageItem.data,
              addedAt: formatDate(new Date()),
              postedAt: messageItem.postedAt ? messageItem.postedAt : dayAfter,
            },
          };
          const newMessage = new pendingMessageAdd(message);
          await newMessage.save();
          successInsert.push(message);
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
        try {
          const message = await Message.findById(messageItem.id);
          if (!message) {
            failedUpdate.push(messageItem.id);
          } else {
            const { id, data, ...messageInfo } = messageItem;
            const newMessage = new pendingMessageUpdate({
              ...messageInfo,
              data: {
                id: messageItem.id,
                old: { ...message._doc },
                new: { ...messageItem.data, addedAt: message._doc.addedAt },
              },
            });
            await newMessage.save();
            successUpdate.push(messageItem.id);
          }
        } catch (error) {
          res
            .status(500)
            .json({ message: 'The request has failed.', error: error });
        }
      })
    );

    const codeStatus = codeStatusHandler(successUpdate, failedUpdate);

    return res.status(codeStatus).json({
      message: 'The request has been received.',
      result: { success: successUpdate, failed: failedUpdate },
    });
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};

exports.postDeleteMessage = async (req, res) => {
  const messages = req.body;
  const successDelete = [];
  const failedDelete = [];

  try {
    await Promise.all(
      messages.map(async (messageItem) => {
        try {
          const message = await Message.findById(messageItem.id);
          if (!message) {
            failedDelete.push(messageItem.id);
          } else {
            const { id, ...messageInfo } = messageItem;
            const { _id, __v, ...messageData } = message._doc;
            const newMessage = new pendingMessageDelete({
              ...messageInfo,
              data: {
                id: messageItem.id,
                ...messageData,
              },
            });
            await newMessage.save();
            successDelete.push(messageItem.id);
          }
        } catch (error) {
          res
            .status(500)
            .json({ message: 'The request has failed.', error: error });
        }
      })
    );

    const codeStatus = codeStatusHandler(successDelete, failedDelete);

    return res.status(codeStatus).json({
      message: 'The request has been received.',
      result: { success: successDelete, failed: failedDelete },
    });
  } catch (error) {
    res.status(500).json({ message: 'The request has failed.', error: error });
  }
};
