const Message = require('../models/message');

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

const { checkSimilarity } = require('../util/js/similarity');
exports.postAddMessage = async (req, res) => {
	const newRecord = {
		message: req.body.message,
		author: req.body.author,
	};

	console.log('checkSimilarity: ', await checkSimilarity(newRecord));
	
	
	res.status(200).json({});

};
