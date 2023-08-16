const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingMessageHead = require('../structure/head');
const pendingMessageData = require('../structure/data');

const pendingMessageDeleteSchema = new Schema({
  ...pendingMessageHead,
  data: {
    id: { type: String, required: true },
		...pendingMessageData,
  },
});

module.exports = mongoose.model(
  'pending-delete',
  pendingMessageDeleteSchema,
  'pending-messages'
);
