const Appointment = require("../models/Appointemnet");
const User = require("../models/User");
const mongoose = require("mongoose");
const Billing = require("../models/Biling");
const MedicalRecord = require("../models/medicalReport");

// Patient books appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

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
    });

    res.status(201).json({ message: "Appointment request sent", appointment });
  } catch (err) {
    console.error("ERROR BOOKING APPOINTMENT:", err);
    res.status(500).json({ error: "An unexpected error occurred while booking." });
  }
};

// Doctor gets appointments (NOW INCLUDES INVOICE AND RECORD INFO)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get the doctor's appointments and populate patient info
    const appointments = await Appointment.find({ doctor_id: user.refId })
      .populate("patient_id", "name age gender contact")
      .lean(); // Use .lean() for better performance

    // For each appointment, check for related records and invoices
    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (app) => {
        // Check if an invoice exists for this appointment
        const invoice = await Billing.findOne({ appointment_id: app._id }).lean();

        // Check if a medical record exists for this appointment
        const medicalRecordExists = await MedicalRecord.exists({ appointment_id: app._id });

        return {
          ...app,
          invoice: invoice, // Attach the full invoice object if found, otherwise null
          hasMedicalRecord: !!medicalRecordExists, // Attach a true/false flag
        };
      })
    );

    res.json({ appointments: appointmentsWithDetails });
  } catch (err) {
    console.error("GET DOCTOR APPOINTMENTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// Doctor updates appointment status (generic update)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let appointment;
    const query = { _id: appointmentId };

    // Find the appointment based on the user's role
    if (user.role === 'doctor') {
      query.doctor_id = user.refId;
    } else if (user.role === 'patient') {
      query.patient_id = user.refId;
      // Add a security rule: patients can ONLY cancel appointments
      if (status !== 'cancelled') {
        return res.status(403).json({ message: "Patients are only permitted to cancel appointments." });
      }
    }

    appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or you are not authorized to modify it." });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Appointment status updated", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor approves or declines an appointment request
exports.manageAppointmentRequest = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { action } = req.body;

    const user = await User.findById(req.user.id);

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor_id: user.refId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or you are not authorized." });
    }

    if (appointment.status !== 'pending_approval') {
        return res.status(400).json({ message: `This appointment is already ${appointment.status} and cannot be changed.` });
    }

    if (action === "approve") {
      appointment.status = "pending_payment";
    } else if (action === "decline") {
      appointment.status = "declined";
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }

    await appointment.save();
    res.json({ message: `Appointment successfully ${action}d.`, appointment });

  } catch (err) {
    console.error("ERROR MANAGING APPOINTMENT:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

// Patient gets their own appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "patient") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ patient_id: user.refId })
      .populate("doctor_id", "name specialization")
      .sort({ createdAt: -1 });

    res.json({ appointments });
  } catch (err) {
    console.error("GET PATIENT APPOINTMENTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// Patient confirms payment for an appointment
exports.confirmPayment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const user = await User.findById(req.user.id);

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patient_id: user.refId,
        });

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        if (appointment.status !== 'pending_payment') {
            return res.status(400).json({ message: `Appointment is not awaiting payment. Current status: ${appointment.status}` });
        }

        appointment.status = 'confirmed';
        await appointment.save();

        res.json({ message: 'Payment confirmed. Your appointment is booked!', appointment });

    } catch (err) {
        console.error("CONFIRM PAYMENT ERROR:", err);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};

// NEW FUNCTION: Get a single appointment by its ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient_id", "name")
      .populate("doctor_id", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ appointment });
  } catch (err) {
    console.error("GET APPOINTMENT BY ID ERROR:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};


exports.getAppointmentsForPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient_id: req.params.patientId })
      .populate("doctor_id", "name specialization")
      .sort({ date: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};