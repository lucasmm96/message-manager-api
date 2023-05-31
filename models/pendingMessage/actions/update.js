const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingMessageHead = require('../structure/head');
const pendingMessageData = require('../structure/data');

const pendingMessageUpdateSchema = new Schema({
  ...pendingMessageHead,
  data: {
    id: { type: String, required: true },
    old: {
      ...pendingMessageData,
    },
    new: {
      ...pendingMessageData,
    },
  },
});

module.exports = mongoose.model(
  'pending-update',
  pendingMessageUpdateSchema,
  'pending-messages'
);
