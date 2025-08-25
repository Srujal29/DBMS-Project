const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
const { bookAppointment, getDoctorAppointments , updateAppointmentStatus} = require("../controllers/AppointemnetControllers");

const router = express.Router();

// Patient books appointment
router.post("/book", protect, checkRole(["patient"]), bookAppointment);

// Doctor gets appointments
router.get("/my-appointments", protect, checkRole(["doctor"]), getDoctorAppointments);

router.put("/:appointmentId/status", protect, checkRole(["doctor"]), updateAppointmentStatus);
module.exports = router;
