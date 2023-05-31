const pendingUserList = require('../models/pending-user');
const pendingMessageList = require('../models/pendingMessage/actions/list');
const formatDate = require('../util/javascript/formatDate');

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
            addedAt: formatDate(new Date()),
            postedAt: messageItem.postedAt ? messageItem.postedAt : dayAfter,
          };

          const newMessage = new Message(message);
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
