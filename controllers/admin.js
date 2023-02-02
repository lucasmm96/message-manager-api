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
