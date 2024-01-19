const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingMessageHead = require('../structure/head');
const pendingMessageData = require('../structure/data');

const pendingMessageAddSchema = new Schema({
  ...pendingMessageHead,
  data: {
    ...pendingMessageData,
  },
});

module.exports = mongoose.model(
  'pending-add',
  pendingMessageAddSchema,
  'pending-messages'
);
