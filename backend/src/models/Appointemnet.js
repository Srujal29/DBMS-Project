const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  // UPDATED: The 'pending_payment' status is removed to simplify the flow.
  status: { 
    type: String, 
    enum: ["pending_approval", "confirmed", "completed", "cancelled", "declined"], 
    default: "pending_approval" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);

