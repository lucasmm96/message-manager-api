const codeStatusHandler = (value01, value02, messageObject) => {
	let message, codeStatus;
	if (value01 && value02) {
		message = messageObject.rejectedAndAccepted;
		codeStatus = 202;
	} else if (value01) {
		message = messageObject.justAccepted;
		codeStatus = 200;
	} else if (value02) {
		message = messageObject.justRejected;
		codeStatus = 400;
	} else {
		message = messageObject.notRejectedNorAccepted;
		codeStatus = 204;
	}
	return { message: message, codeStatus: codeStatus };
};

module.exports = codeStatusHandler;
