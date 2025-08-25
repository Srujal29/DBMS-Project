const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Routes
const authroutes = require("./Routes/authroutes");
const patientRoutes = require("./Routes/patientRoutes");
const doctorRoutes = require("./Routes/doctorRoutes");
const appointmentRoutes = require("./Routes/appointemnetRoutes");
const medicalRecordRoutes = require("./Routes/medicalRecordRoutes");
const billingRoutes = require("./Routes/billingRoutes");
// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authroutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/medical-record", medicalRecordRoutes);
app.use("/api/billing", billingRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Healthcare Data Analysis Backend Running 🚀");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
