// doctorRoutes.js
const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
// ✨ 1. IMPORT THE NEW FUNCTION
const {
  getMyPatients,
  getPatientHistory,
  listAllDoctors,
} = require("../controllers/doctorControllers"); // Corrected the file name here

const router = express.Router();

// ✨ 2. ADD THE NEW PUBLIC ROUTE
// This route allows patients to get a list of all doctors
router.get("/list", listAllDoctors);

// Only doctor can access their patients list
router.get("/all-patients", protect, checkRole(["doctor"]), getMyPatients);

// Fetch full medical history of a specific patient
router.get(
  "/patient-history/:patientId",
  protect,
  checkRole(["doctor"]),
  getPatientHistory
);

module.exports = router;