const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  contact_no: String,
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);
