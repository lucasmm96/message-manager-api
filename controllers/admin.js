const Message = require('../models/message');

exports.getMessageList = (req, res) => {
	Message.find()
		.then((data) => console.log(data))
		.catch((err) => console.log(err));
};
