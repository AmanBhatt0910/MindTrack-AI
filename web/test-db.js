const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.trim().match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^\"|\"$/g, '');
});

const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(env.MONGODB_URI);
  const db = mongoose.connection.db;
  const count = await db.collection('users').countDocuments();
  console.log('Total users:', count);
  const users = await db.collection('users').find({}).toArray();
  console.log('Roles:', users.map(u => u.role));
  
  if (users.length > 0) {
    const doctor = users.find(u => u.role === 'doctor');
    if (doctor) {
      console.log('Doctor found:', doctor._id);
    } else {
      console.log('No doctor found among users.');
    }
  }
  process.exit(0);
}

check();
