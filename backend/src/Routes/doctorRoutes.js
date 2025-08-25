// doctorRoutes.js
const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
const { getMyPatients, getPatientHistory } = require("../controllers/doctorControllers");

const router = express.Router();

// Only doctor can access their patients list
router.get("/all-patients", protect, checkRole(["doctor"]), getMyPatients);

// Fetch full medical history of a specific patient
router.get("/patient-history/:patientId", protect, checkRole(["doctor"]), getPatientHistory);

module.exports = router;
