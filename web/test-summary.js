const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.trim().match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^\"|\"$/g, '');
});

const http = require('http');
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const doctor = await db.collection('users').findOne({ role: 'doctor' });
  if (!doctor) { console.error('No doctor found'); process.exit(1); }
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: doctor._id.toString(), role: 'doctor' }, env.JWT_SECRET);
  
  const assignment = await db.collection('patientdoctors').findOne({ doctorId: doctor._id, status: 'active' });
  if (!assignment) { console.error('No assigned patients found for doctor', doctor._id); process.exit(1); }
  
  const patientId = assignment.patientId.toString();
  console.log('Testing with patient', patientId);
  
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai/clinical-summary',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log('Response:', data));
  });
  
  req.on('error', console.error);
  req.write(JSON.stringify({ patientId }));
  req.end();
}

test();
