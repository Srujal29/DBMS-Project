const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
const { 
  bookAppointment, 
  getDoctorAppointments, 
  updateAppointmentStatus,
  manageAppointmentRequest,
  getPatientAppointments, // ✨ IMPORTED
  confirmPayment,         // ✨ IMPORTED
} = require("../controllers/AppointemnetControllers");

const router = express.Router();

// --- Patient Routes ---
router.post("/book", protect, checkRole(["patient"]), bookAppointment);
router.get("/my-patient-appointments", protect, checkRole(["patient"]), getPatientAppointments); // ✨ NEW ROUTE
router.put("/confirm-payment/:appointmentId", protect, checkRole(["patient"]), confirmPayment); // ✨ NEW ROUTE

// --- Doctor Routes ---
router.get("/my-appointments", protect, checkRole(["doctor"]), getDoctorAppointments);
router.put("/manage-request/:appointmentId", protect, checkRole(["doctor"]), manageAppointmentRequest);
router.put("/:appointmentId/status", protect, checkRole(["doctor"]), updateAppointmentStatus);

module.exports = router;