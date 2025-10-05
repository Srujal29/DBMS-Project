const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require('cors');

// Routes
const authroutes = require("./Routes/authroutes");
const patientRoutes = require("./Routes/patientRoutes"); // Keep this
const doctorRoutes = require("./Routes/doctorRoutes");
const appointmentRoutes = require("./Routes/appointemnetRoutes");
const medicalRecordRoutes = require("./Routes/medicalRecordRoutes");
const billingRoutes = require("./Routes/billingRoutes");
// REMOVED: const documentRoutes = require('./Routes/documentRoutes'); - No longer needed
const adminRoutes = require('./Routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Make the 'uploads' folder publicly accessible
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authroutes);
app.use("/api/patient", patientRoutes); // This now handles patient profiles AND documents
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/medical-record", medicalRecordRoutes);
app.use("/api/billing", billingRoutes);
app.use('/api/admin', adminRoutes); 
// REMOVED: app.use('/api/documents', documentRoutes); - This is now handled by patientRoutes

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
