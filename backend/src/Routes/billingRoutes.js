const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");

// Import all the functions from your billingController
const { 
    generateInvoice, 
    updatePaymentStatus, 
    verifyInsurance,
    downloadInvoice
} = require("../controllers/billingController");

const router = express.Router();

// Route for a doctor to generate an invoice for a specific appointment.
// The ':id' here refers to the APPOINTMENT ID.
router.post("/:id", protect, checkRole(["doctor"]), generateInvoice);

// Route for a patient or admin to update a bill's status (e.g., to 'paid').
// The ':id' here refers to the BILLING ID.
router.put("/:id/status", protect, checkRole(["patient", "admin"]), updatePaymentStatus);

// Route for a doctor or admin to verify insurance against a bill.
router.post("/verify-insurance", protect, checkRole(["doctor", "admin"]), verifyInsurance);

// Route for any authenticated user to download an invoice PDF.
// The ':id' here refers to the BILLING ID.
router.get("/:id/download", protect, downloadInvoice);


module.exports = router;

