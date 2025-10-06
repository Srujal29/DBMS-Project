const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");

// UPDATED: Importing only the functions that exist in your current controller
const { 
  bookAppointment, 
  getDoctorAppointments, 
  updateAppointmentStatus,
  manageAppointmentRequest,
  getPatientAppointments,
  getAppointmentById,
  getAppointmentsForPatient 
} = require("../controllers/AppointemnetControllers");

const router = express.Router();

// --- Patient Routes ---
router.post("/book", protect, checkRole(["patient"]), bookAppointment);
router.get("/my-patient-appointments", protect, checkRole(["patient"]), getPatientAppointments);

// --- Doctor Routes ---
router.get("/my-appointments", protect, checkRole(["doctor"]), getDoctorAppointments);
router.put("/manage-request/:appointmentId", protect, checkRole(["doctor"]), manageAppointmentRequest);
router.get("/patient/:patientId", protect, checkRole(["doctor"]), getAppointmentsForPatient);


// --- Shared Routes ---

// Route for doctors to mark as 'completed' or patients to 'cancel'
router.put("/:appointmentId/status", protect, checkRole(["doctor", "patient"]), updateAppointmentStatus);

// Route to get details of a single appointment
router.get("/:appointmentId", protect, getAppointmentById);


module.exports = router;

