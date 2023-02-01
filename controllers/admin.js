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
	const results = await checkSimilarity(req.body);
	
	res.status(200).json({message: 'The request has been successfully processed.', results: results});
};
