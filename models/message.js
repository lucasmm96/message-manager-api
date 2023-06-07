const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formatDate = require('../util/formatDate');

const messageSchema = new Schema({
  message: { type: String, required: true },
  author: { type: String, required: true },
  addedAt: { type: Date, required: true, default: formatDate(new Date()) },
  postedAt: { type: Date, required: false },
  postUrl: {
    post: { type: String, required: false, default: '' },
    story: { type: String, required: false, default: '' },
  },
});

messageSchema.methods.updateMessage = function (updatedMessage) {
  this.message = updatedMessage.message ? updatedMessage.message : this.message;
  this.author = updatedMessage.author ? updatedMessage.author : this.author;
  this.postedAt = updatedMessage.postedAt
    ? formatDate(updatedMessage.postedAt)
    : this.postedAt;

  if (updatedMessage.postUrl) {
    this.postUrl = {
      post: updatedMessage.postUrl.post
        ? updatedMessage.postUrl.post
        : this.postUrl.post,
      story: updatedMessage.postUrl.story
        ? updatedMessage.postUrl.story
        : this.postUrl.story,
    };
  }

  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
