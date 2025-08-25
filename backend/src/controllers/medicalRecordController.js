const MedicalRecord = require("../models/medicalReport");
const Appointment = require("../models/Appointemnet");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// Doctor adds/updates a medical record
exports.addOrUpdateRecord = async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.id);
    if (!doctorUser || doctorUser.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { appointmentId, diagnosis, treatment, prescribed_medicine } = req.body;

    // Check appointment exists and belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor_id.toString() !== doctorUser.refId.toString()) {
      return res.status(404).json({ message: "Appointment not found or unauthorized" });
    }

    // Check if record already exists
    let record = await MedicalRecord.findOne({ appointment_id: appointmentId });

    if (record) {
      // Update existing record
      record.diagnosis = diagnosis;
      record.treatment = treatment;
      record.prescribed_medicine = prescribed_medicine;
      await record.save();
    } else {
      // Create new record
      record = await MedicalRecord.create({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        appointment_id: appointmentId,
        diagnosis,
        treatment,
        prescribed_medicine
      });
    }

    res.status(201).json({ message: "Medical record saved", record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Doctor fetches all records of a specific patient
exports.getPatientRecords = async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.id);
    if (!doctorUser || doctorUser.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const patientId = req.params.patientId;

    // Fetch all records for this patient by this doctor
    const records = await MedicalRecord.find({ doctor_id: doctorUser.refId, patient_id: patientId })
      .populate("appointment_id", "date time reason")
      .populate("patient_id", "name age gender contact");

    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Patient fetches all their medical records
exports.getMyRecords = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "patient") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const records = await MedicalRecord.find({ patient_id: user.refId })
      .populate("appointment_id", "date time reason")
      .populate("doctor_id", "name specialization contact");

    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
