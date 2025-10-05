const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth.middleware');

// Import all AI controller functions
const { 
    getStaffingRecommendations, 
    getFinancialAnomalies,
    getDiagnosisSuggestion,
    getPatientRiskScore,
    getPreventativeCareSuggestion 
} = require('../controllers/aiController');


// --- Admin Routes ---
// These routes are protected and only accessible by admins.
router.get('/staffing-recommendations', protect, checkRole(['admin']), getStaffingRecommendations);
router.get('/financial-anomalies', protect, checkRole(['admin']), getFinancialAnomalies);


// --- Doctor Routes ---
// These routes are protected and only accessible by doctors.
router.post('/diagnosis-suggestion', protect, checkRole(['doctor']), getDiagnosisSuggestion);
router.get('/patient-risk-score/:patientId', protect, checkRole(['doctor']), getPatientRiskScore);


// --- Patient Route ---
// This route is protected and only accessible by patients.
router.get('/preventative-care', protect, checkRole(['patient']), getPreventativeCareSuggestion);


module.exports = router;

