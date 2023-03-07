const Message = require('../../models/message');
const howSimilar = require('similarity');

function isSimilar(oldMessage, newMessage) {
	let similarity = howSimilar(oldMessage, newMessage);
	if (similarity > 0.5) {
		return { status: true, ratio: `${Math.round(similarity * 100)}%` };
	} else {
		return { status: false, ratio: `${Math.round(similarity * 100)}%` };
	}
}

async function checkSimilarity(newRecord) {
	const successInsert = [];
	const failedInsert = [];
	const records = await Message.find();

	await Promise.all(
		records.map(async (recordItem) => {
			let status = isSimilar(recordItem.message, newRecord.message).status;
			let ratio = isSimilar(recordItem.message, newRecord.message).ratio;

			if (status) {
				failedInsert.push({ similarTo: newRecord.message, ratio: ratio });
			}
		})
	);

	if (failedInsert.length === 0) {
		try {
			successInsert.push(newRecord);
			return { status: false, data: successInsert };
		} catch (error) {
			throw new Error(error);
		}
	}
	return { status: true, data: failedInsert };
}

module.exports = checkSimilarity;
