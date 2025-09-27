import mongoose from 'mongoose';
import Availability from './src/models/availability.js';

async function checkCurrentData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voxvertex');
    console.log('Connected to MongoDB');
    
    // Check all availability records
    const allAvailabilities = await Availability.find({});
    console.log('Total availabilities in database:', allAvailabilities.length);
    
    if (allAvailabilities.length > 0) {
      console.log('\nAll availability records:');
      allAvailabilities.forEach((avail, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log('  _id:', avail._id);
        console.log('  userId:', avail.userId);
        console.log('  date:', avail.date);
        console.log('  date type:', typeof avail.date);
        console.log('  eventTypes:', avail.eventTypes?.length || 0);
        console.log('  modes:', avail.modes);
        console.log('  timeSlots:', avail.timeSlots?.length || 0);
        console.log('  createdAt:', avail.createdAt);
        console.log('  updatedAt:', avail.updatedAt);
      });
    } else {
      console.log('No availability records found in database');
    }
    
    // Check specifically for the speaker we're testing
    const speakerId = '66d4a0c7f7f9a8d29b123456';
    const speakerAvailabilities = await Availability.find({ userId: speakerId });
    console.log(`\nAvailabilities for speaker ${speakerId}:`, speakerAvailabilities.length);
    
    if (speakerAvailabilities.length > 0) {
      console.log('\nSpeaker-specific records:');
      speakerAvailabilities.forEach((avail, index) => {
        console.log(`\nSpeaker Record ${index + 1}:`);
        console.log('  _id:', avail._id);
        console.log('  userId:', avail.userId);
        console.log('  date:', avail.date);
        console.log('  date type:', typeof avail.date);
        console.log('  eventTypes:', avail.eventTypes);
        console.log('  modes:', avail.modes);
        console.log('  timeSlots:', avail.timeSlots);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCurrentData();
