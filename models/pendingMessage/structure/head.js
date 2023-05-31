module.exports = pendingMessageHead = {
  user: { type: String, required: true },
  action: { type: String, enum: ['Add', 'Update', 'Delete'], required: true },
	status: { type: String, required: true, default: 'Pending' , enum: ['Pending', 'Accepted', 'Rejected']},
};
