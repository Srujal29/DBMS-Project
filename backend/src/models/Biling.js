const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["unpaid", "paid", "insurance_pending"], default: "unpaid" },
  insurance_id: { type: mongoose.Schema.Types.ObjectId, ref: "Insurance" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Billing", billingSchema);
