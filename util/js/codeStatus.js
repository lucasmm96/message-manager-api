function codeStatus(successArray, failedArray) {
	const success = successArray.length > 0;
	const failed = failedArray.length > 0;

	if (success && failed) {
		return 202;
	} else if (success) {
		return 200;
	} else if (failed) {
		return 400;
	} else {
		return 204;
	}
}

module.exports = codeStatus;
