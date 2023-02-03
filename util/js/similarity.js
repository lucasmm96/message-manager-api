const howSimilar = require('similarity');
const Message = require('../../models/message');

exports.checkSimilarity = async (newMessages) => {
	let message;
	const acceptedMessages = [];
	const rejectedMessages = [];

	newMessages.flatMap((value1, index) => {
		newMessages.slice(index + 1).map((value2) => {
			let similarity = howSimilar(value1.message, value2.message);
			if (similarity > 0.5) {
				let similarTo = {
					message: value1.message,
					ratio: `${Math.round(similarity * 100)}%`,
				};
				if (rejectedMessages.length > 0) {
					if (
						rejectedMessages[rejectedMessages.length - 1].message ===
						value2.message
					) {
						rejectedMessages[rejectedMessages.length - 1].similarTo.push(
							similarTo
						);
					} else {
						rejectedMessages.push({
							message: value2.message,
							similarTo: [similarTo],
						});
					}
				} else {
					rejectedMessages.push({
						message: value2.message,
						similarTo: [similarTo],
					});
				}
			}
		});
	});

	if (rejectedMessages.length > 0) {
		message = 'The request was rejected due to similarities found.';
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

	if (acceptedMessages.length > 0 && rejectedMessages.length > 0) {
		message = 'The request has been successfully processed. The accepted records are inserted. Also check the rejected ones';
	} else if (acceptedMessages.length > 0) {
		message = 'The request has been successfully processed an inserted.';
	} else if (rejectedMessages.length > 0) {
		message = 'The request has been successfully processed but not inserted due to duplicity. Check the list.';
	} else {
		message = 'The request is empty';
	}

	return { message: message, results: { acceptedMessages, rejectedMessages } };
};
