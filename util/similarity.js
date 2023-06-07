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

async function checkSimilarity(fullData, newRecord) {
  const successValidation = [];
  const failedValidation = [];

  await Promise.all(
    fullData.map(async (recordItem) => {
      let { isSimilar, ratio } = similarity(recordItem.message, newRecord.message);
      if (isSimilar) {
        failedValidation.push({ similarTo: recordItem.message, ratio: ratio });
      }
    })
  );

  if (failedValidation.length === 0) {
    try {
      successValidation.push(newRecord);
      return { isSimilar: false, data: successValidation };
    } catch (error) {
      throw new Error(error);
    }
  }
  return { isSimilar: true, data: failedValidation };
}

module.exports = checkSimilarity;
