const Message = require('../models/message');
const checkSimilarity = require('../util/js/similarity');
const formatDate = require('../util/js/formatDate');
const resMessages = require('../util/json/messages.json');
const codeStatusHandler = require('../util/js/codeStatusHandler');

exports.getMessageById = (req, res) => {
	const id = req.params.messageId;
	Message.findById(id)
		.then((data) => {
			res.status(200).json(data);
		})
		.catch((err) => console.log(err));
};

exports.getMessageList = (req, res) => {
	Message.find()
		.then((data) => {
			res.status(200).json(data);
		})
		.catch((err) => console.log(err));
};

exports.postAddMessage = async (req, res) => {
	const { message, codeStatus, results } = await checkSimilarity(req.body);

	if (results.acceptedMessages.length > 0) {
		try {
			await Message.insertMany(results.acceptedMessages);
		} catch (error) {
			res
				.status(500)
				.json({ message: 'Something went wrong...', result: `${error}` });
		}
	}

	res.status(codeStatus).json({ message: message, results: results });
};

exports.postUpdateMessage = async (req, res) => {
	const input = req.body;
	const ObjectId = require('mongodb').ObjectId;

	let validUpdates = [];
	let accepted = false;
	let rejected = false;

	try {
		validUpdates = await Promise.all(
			input.map(async (inputItem) => {
				let fetchedItem = await Message.findById(new ObjectId(inputItem.id));
				if (fetchedItem) {
					accepted = true;
					let currentId = new ObjectId(inputItem.id);
					let updates = {
						postedAt: inputItem.postedAt ? formatDate(inputItem.postedAt) : fetchedItem.postedAt,
						postUrl: inputItem.postUrl ? inputItem.postUrl : fetchedItem.postUrl,
					};
					await Message.updateOne({ _id: currentId }, { $set: updates });
					return { id: inputItem.id, status: 'UPDATED' };
				} else {
					rejected = true;
					return { id: inputItem.id, status: 'NOT FOUND' };
				}
			})
		);
	} catch (error) {
		return res.status(500).json({ error: `${error}` });
	}

	const { message, codeStatus } = codeStatusHandler(accepted, rejected, resMessages.updateOutput);

	return res.status(codeStatus).json({ message: message, result: validUpdates });
};

exports.getDeleteMessage = async (req, res) => {
	const input = req.body;
	const ObjectId = require('mongodb').ObjectId;

	let validDeletes = [];
	let accepted = false;
	let rejected = false;

	try {
		validDeletes = await Promise.all(
			input.map(async (inputItem) => {
				let fetchedItem = await Message.findById(new ObjectId(inputItem.id));
				if (fetchedItem) {
					accepted = true;
					await Message.deleteOne({ _id: inputItem.id });
					return { id: inputItem.id, status: 'DELETED' };
				} else {
					rejected = true;
					return { id: inputItem.id, status: 'NOT FOUND' };
				}
			})
		);
	} catch (error) {
		return res.status(500).json({ error: `${error}` });
	}

	const { message, codeStatus } = codeStatusHandler(accepted, rejected, resMessages.deleteOutput);

	return res.status(codeStatus).json({ message: message, result: validDeletes });
};
