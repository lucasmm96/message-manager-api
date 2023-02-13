const Message = require('../models/message');
const checkSimilarity = require('../util/js/similarity');
const formatDate = require('../util/js/formatDate');

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
				.json({ message: "Something went wrong...", result: `${error}` });
		}
	}

	res.status(codeStatus).json({ message: message, results: results });
};

exports.postUpdateMessage = async (req, res) => {
	const input = req.body;
	const ObjectId = require('mongodb').ObjectId;

	let validUpdates = [];
	try {
		validUpdates = await Promise.all(
			input.map(async (inputItem) => {
				let fetchedItem = await Message.findById(new ObjectId(inputItem.id));
				if (fetchedItem) {
					let currentId = new ObjectId(inputItem.id);
					let updates = {
						postedAt: inputItem.postedAt ? formatDate(inputItem.postedAt) : fetchedItem.postedAt,
						postUrl: inputItem.postUrl ? inputItem.postUrl : fetchedItem.postUrl
					};

					await Message.updateOne({ _id: currentId }, { $set: updates });
				}
			})
		);
	} catch (error) {
		return res.status(500).json({ error: `${error}` });
	}

	return res.status(200).json({ message: 'Successfully updated.' });
};

exports.getDeleteMessage = async (req, res) => {
	const ObjectId = require('mongodb').ObjectId;
	const id = new ObjectId(req.params.messageId);

	try {
		const result = await Message.deleteOne({ _id: id });
		return res
			.status(200)
			.json({ message: 'Successfully deleted.', result: result });
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Something went wrong...', result: `${error}` });
	}
};
