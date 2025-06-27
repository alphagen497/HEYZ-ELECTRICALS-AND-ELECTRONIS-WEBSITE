// server.js using MongoDB instead of products.json
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT =  process.env.PORT || 3000;

// Replace this with your MongoDB connection string
const MONGO_URI = "MONGO_URI";
const client = new MongoClient(process.env.MONGODB_URI);

let productsCollection;

app.use(cors());
app.use(express.json());


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

async function startServer() {
  try {
    await client.connect();
    const db = client.db("products"); // or any name you like
    productsCollection = db.collection("products");
    console.log("✅ Connected to MongoDB");

    // GET all products
    app.get("/api/products", async (req, res) => {
      const products = await productsCollection.find().toArray();
      res.json(products);
    });

    // GET single product by ID
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

    // POST a new product
app.post("/api/products", async (req, res) => {
  const productData = req.body;

  if (!validateProduct(productData)) {
    return res.status(400).json({ error: "Invalid product data" });
  }

  // ✅ Automatically set offerExpiry if discounted
  if (
    typeof productData.originalPrice === "number" &&
    typeof productData.price === "number" &&
    productData.originalPrice > productData.price
  ) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days from now
    productData.offerExpiry = expiry;
  }

  const result = await productsCollection.insertOne(productData);
  res.status(201).json({ ...productData, _id: result.insertedId });
});


    // PUT (update) product by ID
   // PUT (update) product by ID
app.put("/api/products/:id", async (req, res) => {
  const updatedData = req.body;

  if (!validateProduct(updatedData)) {
    return res.status(400).json({ error: "Invalid product data" });
  }

  try {
    const filter = { _id: new ObjectId(req.params.id) };
    const updateOps = { $set: updatedData };

    // Check if product is now discounted
    if (
      typeof updatedData.originalPrice === "number" &&
      typeof updatedData.price === "number"
    ) {
      if (updatedData.originalPrice > updatedData.price) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7); // 7 days from now
        updateOps.$set.offerExpiry = expiry;
      } else {
        // No longer discounted → remove offerExpiry
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


    // DELETE product by ID
    app.delete("/api/products/:id", async (req, res) => {
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

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
  }
}

startServer();
