const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingUserSchema = new Schema({
  requestDate: { type: Date, required: false },
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
