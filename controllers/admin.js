const Message = require('../models/message');

exports.getMessageList = (req, res) => {
	Message.find()
		.then((data) => {
			res.status(201).json(data);
		})
		.catch((err) => console.log(err));
};

exports.postAddMessage = (req, res, next) => {
	Message.insertMany(req.body)
		.then(() => {
			res.status(201).json({
				message: 'The message has been successfully added.',
				data: {},
			});
		})
		.catch((err) => console.log(err));
};
