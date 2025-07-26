// models/Order.js
const mongoose = require("mongoose");
module.exports = mongoose.model("Order", new mongoose.Schema({
  customerEmail: String,
  items: Array,
  total: Number,
  date: { type: Date, default: Date.now }
}));
