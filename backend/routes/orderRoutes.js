// orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.get("/byEmail/:email", async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
