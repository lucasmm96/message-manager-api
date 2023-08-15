module.exports = pendingMessageHead = {
  requesterId: { type: String, required: true },
	requestedAt: { type: Date, required: true, default: Date.now },
  action: { type: String, enum: ['Add', 'Update', 'Delete'], required: true },
  type: { type: String, enum: ['Approval', 'Backup'], required: true },
	status: { type: String, required: true, default: 'Pending' , enum: ['Pending', 'Approved', 'Rejected']},
};
