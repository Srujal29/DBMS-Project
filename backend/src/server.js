const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require('cors');
const path = require('path'); // 1. Import the 'path' module

// Routes
const authroutes = require("./Routes/authroutes");
const patientRoutes = require("./Routes/patientRoutes");
const doctorRoutes = require("./Routes/doctorRoutes");
const appointmentRoutes = require("./Routes/appointemnetRoutes");
const medicalRecordRoutes = require("./Routes/medicalRecordRoutes");
const billingRoutes = require("./Routes/billingRoutes");
const adminRoutes = require('./Routes/adminRoutes');
const aiRoutes = require('./Routes/aiRoutes');

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// 2. Add the express.static middleware here
// This line makes the 'uploads' folder publicly accessible.
// It assumes your 'uploads' folder is in the root of your backend project (outside 'src').
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));


// API Routes
app.use("/api/auth", authroutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/medical-record", medicalRecordRoutes);
app.use("/api/billing", billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

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

