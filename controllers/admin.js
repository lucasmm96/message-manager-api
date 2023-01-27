const Message = require('../models/message');

exports.getMessageById = (req, res) => {
	const id = req.params.messageId
	Message.findById(id)
		.then((data) => {
			res.status(200).json(data)
		})
		.catch((err) => console.log(err));
}

exports.getMessageList = (req, res) => {
	Message.find()
		.then((data) => {
			res.status(200).json(data);
		})
		.catch((err) => console.log(err));
};

exports.postAddMessage = (req, res) => {
	Message.insertMany(req.body)
		.then(() => {
			res.status(201).json({
				message: 'The message has been successfully added.',
				data: {},
			});
		})
		.catch((err) => console.log(err));
};
