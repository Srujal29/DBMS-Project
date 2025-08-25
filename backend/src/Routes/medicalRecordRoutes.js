const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
const { addOrUpdateRecord, getPatientRecords ,getMyRecords} = require("../controllers/medicalRecordController");

const router = express.Router();

// Add or update medical record (Doctor only)
router.post("/add", protect, checkRole(["doctor"]), addOrUpdateRecord);

// Get all medical records of a patient (Doctor only)
router.get("/patient/:patientId", protect, checkRole(["doctor"]), getPatientRecords);
// Get all medical records of the logged-in patient
router.get("/my-records", protect, checkRole(["patient"]), getMyRecords);

module.exports = router;
