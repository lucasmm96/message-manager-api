const User = require('../models/user');

exports.postSignup = async function (req, res) {
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
		admin: req.body.admin,
	});

	try {
		if (await User.findOne({ email: req.body.email })) {
			res.status(400).json({
				message: 'The request has failed.',
				error: 'This email is already registered.',
			});
			return;
		}
	} catch (error) {
		res.status(500).json({ message: 'The request has failed.', error: error });
		return;
	}

	try {
		await newUser.save();
		res.status(200).json({ message: 'The request has been received.' });
	} catch (error) {
		res.status(500).json({ message: 'The request has failed.', error: error });
	}
};
