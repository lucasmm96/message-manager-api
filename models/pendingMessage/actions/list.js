const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingMessageHead = require('../structure/head');

const pendingMessageListSchema = new Schema({
	...pendingMessageHead,
  data: Schema.Types.Mixed,
});

module.exports = mongoose.model('pending-list', pendingMessageListSchema, 'pending-messages');
