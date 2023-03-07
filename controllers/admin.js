const Message = require('../models/message');
const isSimilar = require('../util/javascript/similarity');
const codeStatusHandler = require('../util/javascript/codeStatus');

exports.getMessageById = async (req, res) => {
	try {
		const data = await Message.findById(req.params.messageId);
		if (data) {
			return res.status(200).json(data);
		}
		return res.status(400).json({ message: 'Record not found.' });
	} catch (error) {
		res.status(500).json({ message: 'The request has failed.', error: error });
	}
};

exports.getMessageList = async (req, res) => {
	try {
		const data = await Message.find();
		if (data) {
			return res.status(200).json(data);
		}
		const formattedData = data.map((item) => ({
			...item._doc,
			addedAt: item._doc.addedAt.toISOString().slice(0, 10),
			postedAt: item._doc.postedAt.toISOString().slice(0, 10),
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
					const newMessage = new Message({ ...messageItem });
					await newMessage.save();
					successInsert.push({ ...messageItem });
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
