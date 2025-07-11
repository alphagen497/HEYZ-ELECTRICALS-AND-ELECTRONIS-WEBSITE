// server.js - MongoDB + Express Backend for Products API

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const verifyToken = require("./middleware/auth");


const app = express();
const PORT = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGODB_URI);
let productsCollection;

app.use(cors());
app.use(express.json());

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);



// Validation function for product fields
function validateProduct(data) {
  const { name, price, quantity, description } = data;
  return (
    typeof name === "string" &&
    typeof price === "number" &&
    typeof quantity === "number" &&
    quantity >= 0 &&
    typeof description === "string"
  );
}

// API Routes
app.get("/api/products", async (req, res) => {
  try {
    const products = await productsCollection.find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await productsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

app.post("/api/products",verifyToken, async (req, res) => {
  const productData = req.body;

  if (!validateProduct(productData)) {
    return res.status(400).json({ error: "Invalid product data" });
  }

  // Add offerExpiry if discounted
  if (
    typeof productData.originalPrice === "number" &&
    typeof productData.price === "number" &&
    productData.originalPrice > productData.price
  ) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    productData.offerExpiry = expiry;
  }

  const result = await productsCollection.insertOne(productData);
  res.status(201).json({ ...productData, _id: result.insertedId });
});

app.put("/api/products/:id",verifyToken, async (req, res) => {
  const updatedData = req.body;

  if (!validateProduct(updatedData)) {
    return res.status(400).json({ error: "Invalid product data" });
  }

  try {
    const filter = { _id: new ObjectId(req.params.id) };
    const updateOps = { $set: updatedData };

    if (
      typeof updatedData.originalPrice === "number" &&
      typeof updatedData.price === "number"
    ) {
      if (updatedData.originalPrice > updatedData.price) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        updateOps.$set.offerExpiry = expiry;
      } else {
        updateOps.$unset = { offerExpiry: "" };
      }
    }

    const result = await productsCollection.findOneAndUpdate(
      filter,
      updateOps,
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ error: "Product not found" });
    res.json(result.value);
  } catch {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

app.delete("/api/products/:id",verifyToken, async (req, res) => {
  try {
    const result = await productsCollection.findOneAndDelete({
      _id: new ObjectId(req.params.id),
    });

    if (!result.value) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", product: result.value });
  } catch {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

// Connect to MongoDB
async function startServer() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    const db = client.db("products");
    productsCollection = db.collection("products");
    console.log("✅ MongoDB connected.");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1); // Stop the server if MongoDB fails
  }
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Mongoose connected (for admin)."))
  .catch(err => {
    console.error("❌ Mongoose connection error:", err);
    process.exit(1);
  });


// Start everything
startServer();
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
