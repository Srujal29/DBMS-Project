const Appointment = require("../models/Appointemnet");
const User = require("../models/User");
const mongoose = require("mongoose");
const Billing = require("../models/Biling"); 
const MedicalRecord = require("../models/medicalReport");

// Patient books appointment, status defaults to 'pending_approval'
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

// Doctor gets their list of appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ doctor_id: user.refId })
      .populate("patient_id", "name age gender contact")
      .lean();

    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (app) => {
        const invoice = await Billing.findOne({ appointment_id: app._id }).lean();
        const medicalRecordExists = await MedicalRecord.exists({ appointment_id: app._id });

        return {
          ...app,
          invoice: invoice, 
          hasMedicalRecord: !!medicalRecordExists,
        };
      })
    );

    res.json({ appointments: appointmentsWithDetails });
  } catch (err) {
    console.error("GET DOCTOR APPOINTMENTS ERROR:", err);
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

    // UPDATED: When a doctor approves, the appointment is now 'confirmed' directly.
    if (action === "approve") {
      appointment.status = "confirmed";
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


// Doctor or Patient updates an appointment status (e.g., to 'completed' or 'cancelled')
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(403).json({ message: "Unauthorized" });

    let query = { _id: appointmentId };
    if (user.role === 'doctor') {
      query.doctor_id = user.refId;
    } else if (user.role === 'patient') {
      query.patient_id = user.refId;
      if (status !== 'cancelled') {
        return res.status(403).json({ message: "Patients are only permitted to cancel appointments." });
      }
    }

    const appointment = await Appointment.findOne(query);

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


// Patient gets their own appointments (includes billing info)
exports.getPatientAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "patient") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ patient_id: user.refId })
      .populate("doctor_id", "name specialization")
      .sort({ createdAt: -1 })
      .lean();

    const appointmentsWithBilling = await Promise.all(
      appointments.map(async (app) => {
        const bill = await Billing.findOne({ appointment_id: app._id }).lean();
        return { ...app, billing: bill };
      })
    );
    res.json({ appointments: appointmentsWithBilling });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single appointment by its ID
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
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

// Get all appointments for a specific patient (for doctors)
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

