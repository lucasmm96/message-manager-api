const Message = require('../../models/message');
const howSimilar = require('similarity');
const outputMessages = require('../json/messages.json').similarityOutput;

const rejectMessage = (message01, message02, similarity, rejectedMessages) => {
	let similarTo = {
		message: message01,
		ratio: `${Math.round(similarity * 100)}%`,
	};

	if (rejectedMessages.length > 0) {
		let lastIndex = rejectedMessages.length - 1;
		let lastMessage = rejectedMessages[lastIndex].message;

		if (lastMessage === message02) {
			rejectedMessages[lastIndex].similarTo.push(similarTo);
		} else {
			rejectedMessages.push({ message: message02, similarTo: [similarTo] });
		}
	} else {
		rejectedMessages.push({ message: message02, similarTo: [similarTo] });
	}
	return rejectedMessages;
};

const isSimilar = (message01, message02) => {
	let similarity = howSimilar(message01, message02);
	return { similar: similarity > 0.5 ? true : false, similarity: similarity };
};

exports.checkSimilarity = async (newMessages) => {
	let acceptedMessages = [];
	let rejectedMessages = [];
	let message;
	let codeStatus;
	let rejected = false;
	
	newMessages.flatMap((input01, index) => {
		newMessages.slice(index + 1).map((input02) => {
			let { similar, similarity } = isSimilar(input01.message, input02.message);

			if (similar) {
				rejectedMessages = rejectMessage(input01.message, input02.message, similarity, rejectedMessages);
			}
		});
	});

	if (rejectedMessages.length > 0) {
		return { message: outputMessages.rejectedInput, codeStatus: 400, results: { acceptedMessages, rejectedMessages } };
	}

	rejectedMessages.length = 0;

	const dbMessages = await Message.find();

	newMessages.map((newMessage) => {
		newMessage = {
			...newMessage,
			addedAt: new Date().toISOString().slice(0, 10),
			postedAt: newMessage.postedAt ? new Date(newMessage.postedAt).toISOString().slice(0, 10) : '',
			postUrl: newMessage.postUrl ? newMessage.postUrl : {}
		}

		dbMessages.map((currentMessage) => {
			let { similar, similarity } = isSimilar(currentMessage.message, newMessage.message);
			if (similar) {
				rejected = true;
				rejectedMessages = rejectMessage(currentMessage.message, newMessage.message, similarity, rejectedMessages);
			}
		});
		
		if (!rejected) { acceptedMessages.push(newMessage) }
		rejected = false;
	});

	const containAccepted = acceptedMessages.length > 0;
	const containRejected = rejectedMessages.length > 0;

	if (containAccepted && containRejected) {
		message = outputMessages.rejectedAndAccepted;
		codeStatus = 202;
	} else if (containAccepted) {
		message = outputMessages.justAccepted;
		codeStatus = 200;
	} else if (containRejected) {
		message = outputMessages.justRejected;
		codeStatus = 400;
	} else {
		message = outputMessages.notRejectedNorAccepted;
		codeStatus = 204;
	}

	return { message: message, codeStatus: codeStatus, results: { acceptedMessages, rejectedMessages } };
};
