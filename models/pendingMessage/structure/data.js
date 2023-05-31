module.exports = pendingMessageData = {
  message: { type: String, required: true },
  author: { type: String, required: true },
  addedAt: { type: Date, required: true },
  postedAt: { type: Date, required: false },
  postUrl: {
    post: { type: String, required: false },
    story: { type: String, required: false },
  },
};
