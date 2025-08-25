const express = require("express");
const { protect, checkRole } = require("../middleware/auth.middleware");
const { getMyProfile } = require("../controllers/patientControllers");

const router = express.Router();

// Only patient can access
router.get("/my-profile", protect, checkRole(["patient"]), getMyProfile);

module.exports = router;
