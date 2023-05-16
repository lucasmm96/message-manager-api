const Message = require('../models/message');
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

exports.postUpdateMessage = async (req, res) => {
	const messages = req.body;
	const successUpdate = [];
	const failedUpdate = [];

	await Promise.all(
		messages.map(async (messageItem) => {
			try {
				const message = await Message.findById(messageItem._id);
				if (message) {
					message.updateMessage({ ...messageItem });
					successUpdate.push(messageItem._id);
				} else {
					failedUpdate.push(messageItem._id);
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
};

exports.getDeleteMessage = async (req, res) => {
	const messages = req.body;
	const successDelete = [];
	const failedDelete = [];

	await Promise.all(
		messages.map(async (messageItem) => {
			try {
				const message = await Message.findById(messageItem._id);
				if (message) {
					await Message.deleteOne({ _id: messageItem._id });
					successDelete.push(messageItem._id);
				} else {
					failedDelete.push(messageItem._id);
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
};
