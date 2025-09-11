const Appointment = require("../models/Appointemnet");
const User = require("../models/User");
const mongoose = require("mongoose"); // ✨ 1. IMPORT MONGOOSE

// Patient books appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // ✨ 2. ADD THIS VALIDATION BLOCK
    // This checks if the doctorId is a valid MongoDB ObjectId format before proceeding.
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid Doctor ID format." });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "patient") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointment = await Appointment.create({
      patient_id: user.refId,
      doctor_id: doctorId,
      date,
      time,
      reason,
      status: "scheduled",
    });

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (err) {
    // ✨ 3. IMPROVED ERROR LOGGING
    console.error("ERROR BOOKING APPOINTMENT:", err);
    res.status(500).json({ error: "An unexpected error occurred while booking." });
  }
};

// Doctor gets appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ doctor_id: user.refId }).populate(
      "patient_id",
      "name age gender contact"
    );

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor updates appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor_id: user.refId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Appointment status updated", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};