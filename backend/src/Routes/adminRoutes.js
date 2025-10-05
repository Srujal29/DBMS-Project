const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth.middleware');

// Import all controller functions from your adminController.js file
const {
    getAnalyticsData,
    getDashboardStats,
    getAllPatients,
    addPatient,
    updatePatient,
    deletePatient,
    getAllDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getBillingOverview,
    getInsuranceRequests,
    updateInsuranceStatus,
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement
} = require('../controllers/adminController');

// This line applies the security middleware to ALL routes defined in this file.
router.use(protect, checkRole(['admin']));

// --- Analytics ---
router.get('/analytics', getAnalyticsData);

// --- Dashboard ---
router.get('/dashboard-stats', getDashboardStats);

// --- Patient Management ---
router.get('/patients', getAllPatients);
router.post('/patient', addPatient);
router.put('/patient/:patientId', updatePatient);
router.delete('/patient/:patientId', deletePatient);

// --- Doctor Management ---
router.get('/doctors', getAllDoctors);
router.post('/doctor', addDoctor);
router.put('/doctor/:doctorId', updateDoctor);
router.delete('/doctor/:doctorId', deleteDoctor);

// --- Billing ---
router.get('/billing-overview', getBillingOverview);

// --- Insurance ---
router.get('/insurance-requests', getInsuranceRequests);
router.put('/insurance/:id', updateInsuranceStatus);

// --- Announcements ---
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);


module.exports = router;

