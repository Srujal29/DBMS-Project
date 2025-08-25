const Appointment = require("../models/Appointemnet");
const User = require("../models/User");

// Patient books appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

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
      status: "scheduled"
    });

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor gets appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ doctor_id: user.refId })
      .populate("patient_id", "name age gender contact");

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body; // expected: "completed", "cancelled", etc.

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointment = await Appointment.findOne({ 
      _id: appointmentId, 
      doctor_id: user.refId 
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