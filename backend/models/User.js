const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  dob: String,
  aadhaar: String,
  pan: String,
  address: String,
  blood: String,
  conditions: String,
  emergencyName: String,
  emergencyPhone: String,
  password: String,
  userId: String,
  qrCode: String, // store base64 QR

  appointments: [
    {
      date: String,
      doctor: String,
      specialty: String,
      status: String
    }
  ],

  reports: [
    {
      date: String,
      testName: String,
      result: String,
      remarks: String
    }
  ],

  medications: [
    {
      medication: String,
      reason: String,
      dosage: String,
      time: String
    }
  ],

  visits: [
    {
      date: String,
      reason: String,
      doctor: String,
      notes: String
    }
  ],

  doctors: [
    {
      name: String,
      specialty: String,
      phone: String,
      email: String
    }
  ],
});

module.exports = mongoose.model('User', UserSchema);
