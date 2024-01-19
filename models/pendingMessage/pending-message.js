const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingMessageHead = require('./structure/head');

const pendingMessageSchema = new Schema({
  ...pendingMessageHead,
  data: Schema.Types.Mixed,
});

module.exports = mongoose.model(
  'pending-message',
  pendingMessageSchema,
  'pending-messages'
);
