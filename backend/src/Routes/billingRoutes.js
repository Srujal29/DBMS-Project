const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
const { generateInvoice, updatePaymentStatus, verifyInsurance } = require("../controllers/billingController");
const { downloadInvoice } = require("../controllers/billingController");

const router = express.Router();

router.post("/:id", protect, checkRole(["doctor"]), generateInvoice);
router.put("/:id/status", protect, checkRole(["admin", "doctor"]), updatePaymentStatus);
router.post("/verify-insurance", protect, checkRole(["doctor", "admin"]), verifyInsurance);
router.get("/:id/download", protect, checkRole(["doctor", "admin"]), downloadInvoice);

module.exports = router;



