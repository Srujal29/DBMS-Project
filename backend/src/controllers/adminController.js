const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointemnet');
const Billing = require('../models/Biling');
const MedicalRecord = require('../models/medicalReport');
const Announcement = require('../models/Announcement');
const bcrypt = require('bcryptjs');

// --- Billing Overview ---
exports.getBillingOverview = async (req, res) => {
  try {
    // Fetch all billing records and populate patient/doctor names
    const bills = await Billing.find({})
      .populate('patient_id', 'name')
      .populate('doctor_id', 'name')
      .sort({ createdAt: -1 });

    // Calculate statistics using MongoDB aggregation for efficiency
    const revenueCalc = await Billing.aggregate([
        { $group: { _id: '$status', total: { $sum: '$amount' } } }
    ]);

    let totalRevenue = 0;
    let pendingAmount = 0;
    let insurancePendingAmount = 0;

    // Process the aggregated results
    revenueCalc.forEach(group => {
        if(group._id === 'paid') totalRevenue = group.total;
        if(group._id === 'unpaid') pendingAmount = group.total;
        if(group._id === 'insurance_pending') insurancePendingAmount = group.total;
    });

    // Send the data in the format the frontend expects
    res.json({ 
        bills,
        stats: {
            totalRevenue,
            pendingAmount,
            // Frontend expects 'paidAmount' for insurance, so we map it here
            paidAmount: insurancePendingAmount, 
            totalBills: bills.length
        }
    });
  } catch (err) {
    console.error("Billing Overview Error:", err.message);
    res.status(500).json({ message: 'Failed to fetch billing records' });
  }
};


// --- Other Admin Controller Functions ---

exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const totalRevenueResult = await Billing.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending_approval' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const pendingPayments = await Billing.countDocuments({ status: 'unpaid' });
    const insuranceRequests = await Billing.countDocuments({ status: 'insurance_pending' });
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(3).populate('patient_id', 'name');
    const recentActivities = recentAppointments.map(app => ({
        description: `New appointment created for patient ${app.patient_id?.name || 'N/A'}`,
        timestamp: app.createdAt,
        type: 'appointment'
    }));

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
        pendingAppointments,
        completedAppointments,
        pendingPayments,
        insuranceRequests,
      },
      recentActivities,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAnalyticsData = async (req, res) => {
    try {
        const { timeRange } = req.query; 
        let startDate = new Date();
        let dateFormat = "%Y-%m-%d"; 

        if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (timeRange === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
            dateFormat = "%Y-%m";
        } else {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const appointmentsOverTime = await Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const revenueOverTime = await Billing.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'paid' } },
            { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, total: { $sum: "$amount" } } },
            { $sort: { _id: 1 } }
        ]);
        
        const appointmentsBySpecialization = await Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $lookup: { from: 'doctors', localField: 'doctor_id', foreignField: '_id', as: 'doctorInfo' } },
            { $unwind: '$doctorInfo' },
            { $group: { _id: '$doctorInfo.specialization', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const doctorWorkload = await Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$doctor_id', count: { $sum: 1 } } },
            { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctorInfo' } },
            { $unwind: '$doctorInfo' },
            { $project: { _id: 0, doctorName: '$doctorInfo.name', count: 1 } },
            { $sort: { count: -1 } }
        ]);
        
        const appointmentStatusDistribution = await Appointment.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const revenueBySpecialization = await Billing.aggregate([
             { $match: { createdAt: { $gte: startDate }, status: 'paid' } },
             { $lookup: { from: 'doctors', localField: 'doctor_id', foreignField: '_id', as: 'doctorInfo' } },
             { $unwind: '$doctorInfo' },
             { $group: { _id: '$doctorInfo.specialization', totalRevenue: { $sum: '$amount' } } },
             { $sort: { totalRevenue: -1 } }
        ]);

        const mostCommonDiagnoses = await MedicalRecord.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 7 } 
        ]);

        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalAppointments = await Appointment.countDocuments();
        const totalRevenueResult = await Billing.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        res.json({
            appointmentsOverTime,
            revenueOverTime,
            appointmentsBySpecialization,
            doctorWorkload,
            appointmentStatusDistribution,
            revenueBySpecialization,
            mostCommonDiagnoses,
            summaryStats: { totalPatients, totalDoctors, totalAppointments, totalRevenue }
        });

    } catch (err) {
        console.error("Analytics Error:", err.message);
        res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { title, content, targetRoles } = req.body;
  try {
    const newAnnouncement = await Announcement.create({ title, content, targetRoles });
    res.status(201).json({ message: 'Announcement created successfully', announcement: newAnnouncement });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const users = await User.find({ role: 'patient' }).populate('refId');
    const patients = users.map(user => ({
      ...user.refId._doc,
      _id: user.refId._id,
      userId: user._id,
      username: user.username,
    }));
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
};

exports.addPatient = async (req, res) => {
    const { name, username, password, dateOfBirth, gender, contact, address, email } = req.body;
    try {
        const patientProfile = await Patient.create({ name, dob: dateOfBirth, gender, contact_no: contact, address, email });
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            password: hashedPassword,
            role: 'patient',
            refId: patientProfile._id,
            roleRef: 'Patient'
        });
        res.status(201).json({ message: 'Patient created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create patient', error: err.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        await Patient.findByIdAndUpdate(req.params.patientId, req.body);
        res.json({ message: 'Patient updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update patient' });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const user = await User.findOne({ refId: patientId, role: 'patient' });
        if (user) {
            await User.deleteOne({ _id: user._id });
        }
        await Patient.deleteOne({ _id: patientId });
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete patient' });
    }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const users = await User.find({ role: 'doctor' }).populate('refId');
    const doctors = users.map(user => ({
        ...user.refId._doc,
        _id: user.refId._id,
        userId: user._id,
        username: user.username,
    }));
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
};

exports.addDoctor = async (req, res) => {
    const { name, username, password, specialization, qualification, experience, contact, email } = req.body;
    try {
        const doctorProfile = await Doctor.create({ name, specialization, qualification, experience, contact_no: contact, email });
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            password: hashedPassword,
            role: 'doctor',
            refId: doctorProfile._id,
            roleRef: 'Doctor'
        });
        res.status(201).json({ message: 'Doctor created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create doctor', error: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        await Doctor.findByIdAndUpdate(req.params.doctorId, req.body);
        res.json({ message: 'Doctor updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update doctor' });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const user = await User.findOne({ refId: doctorId, role: 'doctor' });
        if (user) {
            await User.deleteOne({ _id: user._id });
        }
        await Doctor.deleteOne({ _id: doctorId });
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete doctor' });
    }
};

exports.getInsuranceRequests = async (req, res) => {
    try {
        res.json({ requests: [], stats: { pending: 0, verified: 0, rejected: 0, total: 0 } });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch insurance requests' });
    }
};

exports.updateInsuranceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        console.log(`Updating insurance claim ${id} to ${status} with notes: ${notes}`);
        res.json({ message: 'Insurance status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update insurance status' });
    }
};

