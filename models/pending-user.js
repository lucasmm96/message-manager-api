const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingUserSchema = new Schema({
  action: { type: String, required: true, default: 'Add', enum: ['Add', 'Delete'] },
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true },
});

module.exports = mongoose.model(
  'Pending-Users',
  pendingUserSchema,
  'pending-users'
);
