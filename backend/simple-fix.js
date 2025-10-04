import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected!');
    
    const db = mongoose.connection.db;
    const collection = db.collection('enhancedeventregistrations');
    
    console.log('Dropping registrationId_1 index...');
    await collection.dropIndex('registrationId_1');
    console.log('Index dropped successfully!');
    
    console.log('Remaining indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => console.log('-', index.name));
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    if (error.message.includes('index not found')) {
      console.log('Index already removed or never existed.');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

fixIndex();
