const Message = require('../models/message');
const formatDate = require('./formatDate');

async function lastPostDate() {
  const result = await Message.find({ postedAt: { $exists: true } })
    .sort({ postedAt: -1 })
    .limit(1);
  const maxPostedAt = formatDate(result[0].postedAt.toISOString());

  return maxPostedAt;
}

module.exports = lastPostDate;
