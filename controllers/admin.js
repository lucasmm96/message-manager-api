const Message = require('../models/message');
const { checkSimilarity } = require('../util/js/similarity');

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
	const { message, results } = await checkSimilarity(req.body);

	if (results.acceptedMessages.length > 0) {
		try {
			await Message.insertMany(results.acceptedMessages);
		} catch (error) {
			res.status(500).json({ message: `Something went wrong... (${error})`, data: {} });
		}
	}
	
	res.status(200).json({ message: message, results: results });
};

exports.postUpdateMessage = async (req, res) => {

	const id = req.body.id;
	const postedAt = new Date(req.body.postedAt).toISOString().slice(0,10);
	const postUrl = req.body.postUrl ? req.body.postUrl  : [];
	
	const fetchedMessage = await Message.findById(id)
	
	if (fetchedMessage.length === 0) {
		res.status(500).json({ message: 'Record not found', data: {} });
	} else {
		try {
			if (postUrl.length > 0) {
				postUrl.map(async (url) => {
					await Message.updateOne(
						{ _id: id },
						{ $push: { postUrl: url } }
					);
				});
			}
		} catch (error) {
			res.status(500).json({ message: `Something went wrong... (${error})`, data: {} });
		}
		
		try {
			await Message.updateOne(
				{ _id: id },
				{ $set: { postedAt: postedAt }}
			);
		} catch (error) {
			res.status(500).json({ message: `Something went wrong... (${error})`, data: {} });
		}
		
		res.status(200).json({ message: "The message has been successfully updated.", results: { fetchedMessage, afterUpdate } });	
	}
}