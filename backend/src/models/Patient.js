const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: String,
  dob: Date,
  gender: String,
  contact_no: String,
  address: String,
  insurance_id: { type: mongoose.Schema.Types.ObjectId, ref: "Insurance" }
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);
