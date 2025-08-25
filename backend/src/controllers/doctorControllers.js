const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Appointment = require("../models/Appointemnet");
const MedicalRecord = require("../models/medicalReport");

// Get all patients of the doctor (existing)
exports.getMyPatients = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const doctor = await Doctor.findById(user.refId);
    if (!doctor) return res.status(404).json({ message: "Doctor record not found" });

    const appointments = await Appointment.find({ doctor_id: doctor._id }).populate("patient_id");

    const patientSet = new Set();
    const patients = [];
    appointments.forEach(app => {
      if (app.patient_id && !patientSet.has(app.patient_id._id.toString())) {
        patientSet.add(app.patient_id._id.toString());
        patients.push(app.patient_id);
      }
    });

    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get full medical history of a specific patient (new)
exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params; // doctor passes patientId in URL

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") return res.status(403).json({ message: "Unauthorized" });

    const doctor = await Doctor.findById(user.refId);
    if (!doctor) return res.status(404).json({ message: "Doctor record not found" });

    const records = await MedicalRecord.find({
      doctor_id: doctor._id,
      patient_id: patientId
    })
      .populate("appointment_id", "date time reason status")
      .populate("patient_id", "name age gender contact");

    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
