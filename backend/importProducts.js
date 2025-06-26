const { MongoClient } = require("mongodb");
const fs = require("fs");

// Replace this with your actual connection string
const uri = "mongodb+srv://mwauraisaac024:2BsBonS3JMPBeldf@cluster0.zmp9cpd.mongodb.net/products?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function importProducts() {
  try {
    await client.connect();
    const db = client.db("products"); // or whatever your DB name is
    const collection = db.collection("products");

    const rawData = fs.readFileSync("products.json");
    const products = JSON.parse(rawData);

    if (!Array.isArray(products)) {
      throw new Error("JSON file does not contain an array");
    }

    const result = await collection.insertMany(products);
    console.log(`✅ Imported ${result.insertedCount} products`);
  } catch (err) {
    console.error("❌ Import failed:", err.message);
  } finally {
    await client.close();
  }
}

importProducts();
