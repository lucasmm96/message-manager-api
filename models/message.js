const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
	message: { type: String, required: true },
	author: { type: String, required: true },
	addedAt: { type: Date, required: true},
	postedAt: { type: Date, required: false},
	postUrl: { type: Array, required: false}
});

module.exports = mongoose.model('Message', messageSchema);
