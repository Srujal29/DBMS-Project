const mongoose = require("mongoose");
const insuranceSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  provider: { type: String, required: true },
  policy_number: { type: String, required: true },
  coverage_limit: { type: Number, required: true }, // e.g., ₹1,00,000
  used_amount: { type: Number, default: 0 },        // how much has been used
  valid_till: { type: Date, required: true }
});

module.exports = mongoose.model("Insurance", insuranceSchema);
