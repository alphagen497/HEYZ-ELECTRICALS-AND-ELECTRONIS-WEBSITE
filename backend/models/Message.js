const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true,match: [/.+@.+\..+/, 'Please enter a valid email'] },
  phone: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  archived: { type: Boolean, default: false },
}, {
  timestamps: true

});

module.exports = mongoose.model('Message', messageSchema);
