const mongoose = require('mongoose');
require('dotenv').config(); // if you use .env
const Log = require('./models/Log'); // adjust path as needed

// Update this with your actual connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/HabitTracker';

const statusToScore = {
  completed: 2,
  partial: 1,
  missed: 0,
  off: 'f',
  f: 'f'
};

async function updateLogs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const logsToUpdate = await Log.find({ score: { $exists: false } });

    console.log(`Found ${logsToUpdate.length} logs to update...`);

    for (const log of logsToUpdate) {
      const newScore = statusToScore[log.status];
      if (newScore === undefined) {
        console.warn(`⚠️ Unknown status: "${log.status}" for log ID ${log._id}`);
        continue;
      }

      log.score = newScore;
      await log.save();
      console.log(`✅ Updated log ${log._id} with score: ${newScore}`);
    }

    console.log('🎉 All applicable logs updated.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during update:', err);
    process.exit(1);
  }
}

updateLogs();
