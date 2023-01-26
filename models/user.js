const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	messages: [
		{
			id: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
			addedAt: { type: Date, required: true },
			postedAt: { type: Date, required: false },
		},
	],
});

userSchema.methods.addMessage = function (messageId, addedAt, postedAt) {
	const newMessage = {
		id: messageId,
		addedAt: addedAt,
		postedAt: postedAt,
	};
	this.books.push(newMessage);
	return this.save();
};

userSchema.methods.updateMessage = function (MessageIndex, postedAt) {
	this.messages[MessageIndex].postedAt = postedAt;
	return this.save();
};

userSchema.methods.removeMessage = function (messageId) {
	const udpdatedMessageList = this.messages.filter((selectedItem) => {
		return selectedItem.id.toString() !== messageId.toString();
	});
	this.messages = udpdatedMessageList;
	return this.save();
};

module.exports = mongoose.model('User', userSchema);
