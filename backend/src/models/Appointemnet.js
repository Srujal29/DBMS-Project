const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },   // Date as string (e.g., "2025-08-25")
  time: { type: String, required: true },   // Time as string (e.g., "10:30 AM")
  reason: { type: String, required: true },
  // ✨ THIS LINE HAS BEEN UPDATED
  status: { 
    type: String, 
    enum: ["pending_approval", "pending_payment", "confirmed", "completed", "cancelled", "declined"], 
    default: "pending_approval" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);