const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  diagnosis: String,
  treatment: String,
  prescribed_medicine: [String]
}, { timestamps: true });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
