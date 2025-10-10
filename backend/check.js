import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


async function connectAndFetch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to remote MongoDB!");

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Fetch documents from a specific collection (example: products)
    if (collections.length > 0) {
      const data = await mongoose.connection.db.collection(collections[0].name).find({}).toArray();
      console.log(`Documents in ${collections[0].name}:`, data);
    }

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Connection error:", err);
  }
}

connectAndFetch();
