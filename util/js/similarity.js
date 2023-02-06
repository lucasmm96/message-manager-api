const Message = require('../../models/message');
const howSimilar = require('similarity');
const outputMessages = require('../json/messages.json').similarityOutput;

exports.checkSimilarity = async (newMessages) => {
	let message;
	const acceptedMessages = [];
	const rejectedMessages = [];

	newMessages.flatMap((input01, index) => {
		newMessages.slice(index + 1).map((input02) => {
			let similarity = howSimilar(input01.message, input02.message);
			if (similarity > 0.5) {
				let similarTo = {
					message: input01.message,
					ratio: `${Math.round(similarity * 100)}%`,
				};
				if (rejectedMessages.length > 0) {
					if (
						rejectedMessages[rejectedMessages.length - 1].message ===
						input02.message
					) {
						rejectedMessages[rejectedMessages.length - 1].similarTo.push(
							similarTo
						);
					} else {
						rejectedMessages.push({
							message: input02.message,
							similarTo: [similarTo],
						});
					}
				} else {
					rejectedMessages.push({
						message: input02.message,
						similarTo: [similarTo],
					});
				}
			}
		});
	});

	if (rejectedMessages.length > 0) {
		message = outputMessages.rejectedInput;
		return { message: message, results: { acceptedMessages, rejectedMessages } };
	} else {
		rejectedMessages.length = 0;
	}

	const currentMessages = await Message.find();

	newMessages.map((newMessage) => {
		let addedAt = new Date().toISOString().slice(0, 10);
		let postedAt = newMessage.postedAt ? new Date(newMessage.postedAt).toISOString().slice(0, 10) : '';
		let postUrl = newMessage.postUrl ? newMessage.postUrl : {};

		newMessage = { ...newMessage, addedAt: addedAt, postedAt: postedAt, postUrl: postUrl };

		currentMessages.map((currentMessage) => {
			let similarity = howSimilar(currentMessage.message, newMessage.message);

			if (similarity > 0.5) {
				let similarTo = {
					message: currentMessage.message,
					ratio: `${Math.round(similarity * 100)}%`,
				};
				if (rejectedMessages.length > 0) {
					let rejectedMessagesItem = rejectedMessages[rejectedMessages.length - 1];
					if (rejectedMessagesItem.message === newMessage.message) {
						rejectedMessagesItem.similarTo.push(similarTo);
					} else {
						rejectedMessages.push({ message: newMessage.message, similarTo: [similarTo] });
					}
				} else {
					rejectedMessages.push({ message: newMessage.message, similarTo: [similarTo] });
				}
			}
		});

		if (rejectedMessages.length === 0) {
			acceptedMessages.push(newMessage);
		} else {
			let rejectedMessagesItem = rejectedMessages[rejectedMessages.length - 1];
			if (rejectedMessagesItem.message !== newMessage.message) {
				acceptedMessages.push(newMessage);
			}
		}
	});

	
	const acceptedLength = acceptedMessages.length > 0;
	const rejectedLength = rejectedMessages.length > 0;
	
	if (acceptedLength && rejectedLength) {
		message = outputMessages.rejectedAndAccepted
	} else if (acceptedLength) {
		message = outputMessages.justAccepted
	} else if (rejectedLength) {
		message = outputMessages.justRejected
	} else {
		message = outputMessages.notRejectedNorAccepted
	}

	return { message: message, results: { acceptedMessages, rejectedMessages } };
};
