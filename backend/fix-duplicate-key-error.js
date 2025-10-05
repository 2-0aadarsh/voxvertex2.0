#!/usr/bin/env node

/**
 * Database Maintenance Script: Fix Duplicate Key Error
 * 
 * This script removes the stale 'registrationId_1' unique index from the
 * enhancedeventregistrations collection that was left behind after removing
 * the registrationId field from the Mongoose schema.
 * 
 * Error being fixed:
 * E11000 duplicate key error collection: test.enhancedeventregistrations 
 * index: registrationId_1 dup key: { registrationId: null }
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const COLLECTION_NAME = 'enhancedeventregistrations';
const INDEX_NAME = 'registrationId_1';

async function fixDuplicateKeyError() {
  try {
    console.log('🔧 Starting database maintenance: Fixing duplicate key error...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    console.log(`📡 Connecting to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Get the collection
    const collection = db.collection(COLLECTION_NAME);
    console.log(`📋 Working with collection: ${COLLECTION_NAME}`);

    // List all indexes on the collection
    console.log('🔍 Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log(`📊 Found ${indexes.length} indexes:`);
    
    indexes.forEach((index, i) => {
      const indexName = index.name || 'unnamed';
      const isUnique = index.unique ? ' (UNIQUE)' : '';
      const isTarget = indexName === INDEX_NAME ? ' ← TARGET' : '';
      console.log(`  ${i + 1}. ${indexName}${isUnique}${isTarget}`);
    });

    // Check if the problematic index exists
    const targetIndex = indexes.find(index => index.name === INDEX_NAME);
    
    if (!targetIndex) {
      console.log(`✅ Index '${INDEX_NAME}' not found. No action needed.`);
      console.log('🎉 Database is already in the correct state!');
      return;
    }

    console.log(`⚠️  Found problematic index: ${INDEX_NAME}`);
    console.log(`   Unique: ${targetIndex.unique}`);
    console.log(`   Key: ${JSON.stringify(targetIndex.key)}`);

    // Drop the problematic index
    console.log(`🗑️  Dropping index: ${INDEX_NAME}...`);
    await collection.dropIndex(INDEX_NAME);
    console.log(`✅ Successfully dropped index: ${INDEX_NAME}`);

    // Verify the index was removed
    console.log('🔍 Verifying index removal...');
    const updatedIndexes = await collection.indexes();
    const indexStillExists = updatedIndexes.find(index => index.name === INDEX_NAME);
    
    if (indexStillExists) {
      console.error(`❌ ERROR: Index '${INDEX_NAME}' still exists after drop attempt!`);
      throw new Error('Failed to drop the problematic index');
    }

    console.log(`✅ Confirmed: Index '${INDEX_NAME}' has been removed`);
    
    // Show remaining indexes
    console.log('📊 Remaining indexes:');
    updatedIndexes.forEach((index, i) => {
      const indexName = index.name || 'unnamed';
      const isUnique = index.unique ? ' (UNIQUE)' : '';
      console.log(`  ${i + 1}. ${indexName}${isUnique}`);
    });

    console.log('🎉 Database maintenance completed successfully!');
    console.log('');
    console.log('📝 What was fixed:');
    console.log('   • Removed stale unique index on registrationId field');
    console.log('   • Resolved E11000 duplicate key error');
    console.log('   • Users can now register for multiple events without conflicts');
    console.log('');
    console.log('🚀 You can now test event registration again!');

  } catch (error) {
    console.error('❌ Database maintenance failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting steps:');
    console.error('   1. Check MongoDB connection string in .env file');
    console.error('   2. Ensure MongoDB is running');
    console.error('   3. Verify database permissions');
    console.error('   4. Check if the collection exists');
    process.exit(1);
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('📡 Disconnected from MongoDB');
    }
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDuplicateKeyError()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default fixDuplicateKeyError;


