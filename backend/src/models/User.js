const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // hashed password
  role: { type: String, enum: ["patient", "doctor"], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "roleRef" }, 
  roleRef: { type: String, required: true, enum: ["Patient", "Doctor"] } // dynamic reference
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
