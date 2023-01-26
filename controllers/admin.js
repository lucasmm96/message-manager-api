const Message = require('../models/message');

exports.getMessageList = (req, res) => {
	Message.find()
		.then((data) => {
			res.status(201).json(data);
		})
		.catch((err) => console.log(err));
};

exports.postAddMessage = (req, res, next) => {
	const message = req.body.message;
	const author = req.body.author;
	const newMessage = new Message({
		message: message,
		author: author,
	});
	newMessage
		.save()
		.then(() => {
			res.status(201).json({
				message: 'The message has been successfully added.',
				data: {},
			});
		})
		.catch((err) => console.log(err));
};
