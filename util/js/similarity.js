const howSimilar = require('similarity');
const Message = require('../../models/message');

exports.checkSimilarity = async (newRecord) => {
	const acceptedData = [];
	const rejectedData = [];
	const data = await Message.find();

	data.forEach((currentRecord) => {
		if (howSimilar(currentRecord.message, newRecord.message) > 0.5) {
			rejectedData.push({
				current_record: {
					id: currentRecord.id,
					message: currentRecord.message,
					author: currentRecord.author,
				},
				new_record: {
					message: newRecord.message,
					author: newRecord.author,
				},
			});
		}
	});
	if (rejectedData.length === 0) {
		acceptedData.push({
			message: newRecord.message,
			author: newRecord.author,
		});
	}
	return { acceptedData, rejectedData };
};
