const howSimilar = require('similarity');
const Message = require('../../models/message');

exports.checkSimilarity = async (newMessages) => {
	const acceptedMessages = [];
	const rejectedMessages = [];
	const currentMessages = await Message.find();

	newMessages.map((newMessage) => {
		currentMessages.map((currentMessage) => {
			let similarity = howSimilar(currentMessage.message, newMessage.message);

			if (similarity > 0.5) {
				let similarTo = {
					message: currentMessage.message,
					ratio: `${Math.round(similarity * 100)}%`,
				};
				if (rejectedMessages.length > 0) {
					if (
						rejectedMessages[rejectedMessages.length - 1].message === newMessage.message) {
						rejectedMessages[rejectedMessages.length - 1].similarTo.push(similarTo);
					} else {
						rejectedMessages.push({ message: newMessage.message, similarTo: [similarTo] });
					}
				} else {
					rejectedMessages.push({ message: newMessage.message, similarTo: [similarTo] });
				}
			}
		});

		const rejectedMessagesLength = rejectedMessages.length > 0;
		const isRejected = rejectedMessages[rejectedMessages.length - 1].message !== newMessage.message;
		if (rejectedMessagesLength && isRejected) {
			acceptedMessages.push(newMessage);
		}
	});

	return { acceptedMessages, rejectedMessages };
};
