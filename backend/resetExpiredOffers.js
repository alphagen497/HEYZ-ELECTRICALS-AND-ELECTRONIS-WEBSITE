// resetExpiredOffers.js
const { MongoClient } = require("mongodb");

const uri = "your_mongodb_connection_string"; // Replace with yours
const client = new MongoClient(uri);

async function resetExpiredOffers() {
  try {
    await client.connect();
    const db = client.db("products");
    const products = db.collection("products");

    const now = new Date();

    const expiredProducts = await products.find({
      offerExpiry: { $lte: now },
      $expr: { $lt: ["$price", "$originalPrice"] }
    }).toArray();

    if (expiredProducts.length === 0) {
      console.log("✅ No expired offers found.");
      return;
    }

    const updates = expiredProducts.map(prod => ({
      updateOne: {
        filter: { _id: prod._id },
        update: {
          $set: { price: prod.originalPrice },
          $unset: { offerExpiry: "" }
        }
      }
    }));

    const result = await products.bulkWrite(updates);
    console.log(`✅ Reset ${result.modifiedCount} expired offer(s).`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

resetExpiredOffers();
