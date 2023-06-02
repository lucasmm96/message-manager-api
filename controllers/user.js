const pendingMessageAdd = require('../models/pendingMessage/actions/add');
const pendingMessageUpdate = require('../models/pendingMessage/actions/update');
const pendingMessageDelete = require('../models/pendingMessage/actions/delete');
const Message = require('../models/message');

const isSimilar = require('../util/javascript/similarity');
const formatDate = require('../util/javascript/formatDate');
const lastPostDate = require('../util/javascript/lastPostDate');
const codeStatusHandler = require('../util/javascript/codeStatus');

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
      const { status, data } = await isSimilar(messageItem.data); //TODO: mudar de "status" para "isSimilar" dentro do modulo isSimilar
      if (status) {
        failedInsert.push({ message: messageItem.data, similarity: data });
      } else {
        const maxPostedAt = new Date(await lastPostDate());
        const dayAfter = formatDate(
          maxPostedAt.setDate(maxPostedAt.getDate() + 1)
        );
        const newMessage = new pendingMessageAdd({
          ...messageItem,
          data: {
            ...messageItem.data,
            addedAt: formatDate(new Date()),
            postedAt: messageItem.postedAt ? messageItem.postedAt : dayAfter,
          },
        });
        await newMessage.save();
        successInsert.push(messageItem.data);
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
