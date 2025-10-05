const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
const {
  bookAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  manageAppointmentRequest,
  getPatientAppointments,
  confirmPayment,
  getAppointmentById, // ✨ IMPORT THE NEW FUNCTION
  getAppointmentsForPatient
} = require("../controllers/AppointemnetControllers");

const router = express.Router();

// --- Patient Routes ---
router.post("/book", protect, checkRole(["patient"]), bookAppointment);
router.get("/my-patient-appointments", protect, checkRole(["patient"]), getPatientAppointments);
router.put("/confirm-payment/:appointmentId", protect, checkRole(["patient"]), confirmPayment);

// --- Doctor Routes ---
router.get("/my-appointments", protect, checkRole(["doctor"]), getDoctorAppointments);
router.put("/manage-request/:appointmentId", protect, checkRole(["doctor"]), manageAppointmentRequest);
// To (in Routes/appointemnetRoutes.js)
router.put("/:appointmentId/status", protect, checkRole(["doctor", "patient"]), updateAppointmentStatus);

// --- Shared Route for getting a single appointment ---
router.get("/:appointmentId", protect, getAppointmentById); // ✨ ADD THE NEW ROUTE
router.get("/patient/:patientId", protect, checkRole(["doctor"]), getAppointmentsForPatient);

module.exports = router;
