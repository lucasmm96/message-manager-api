const Message = require('../models/message');
const howSimilar = require('similarity');

function similarity(oldMessage, newMessage) {
  let similarity = howSimilar(oldMessage, newMessage);
  if (similarity > 0.5) {
    return { isSimilar: true, ratio: `${Math.round(similarity * 100)}%` };
  } else {
    return { isSimilar: false, ratio: `${Math.round(similarity * 100)}%` };
  }
}

async function checkSimilarity(newRecord) {
  const successInsert = [];
  const failedInsert = [];
  const records = await Message.find();

  await Promise.all(
    records.map(async (recordItem) => {
      let { isSimilar, ratio } = similarity(recordItem.message, newRecord.message);
      if (isSimilar) {
        failedInsert.push({ similarTo: recordItem.message, ratio: ratio });
      }
    })
  );

  if (failedInsert.length === 0) {
    try {
      successInsert.push(newRecord);
      return { isSimilar: false, data: successInsert };
    } catch (error) {
      throw new Error(error);
    }
  }
  return { isSimilar: true, data: failedInsert };
}

module.exports = checkSimilarity;
