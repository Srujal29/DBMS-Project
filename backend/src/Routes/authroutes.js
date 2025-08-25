const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { protect, checkRole } = require("../middleware/auth.middleware");

const router = express.Router();

// ✅ Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// ✅ Role based protected routes
// Patient apna profile dekh sake
router.get("/my-profile", protect, checkRole(["patient"]), (req, res) => {
  res.json({ message: `Patient profile of user ${req.user.id}` });
});

// Doctor sab patients dekh sake
router.get("/all-patients", protect, checkRole(["doctor"]), (req, res) => {
  res.json({ message: "List of all patients (only for doctors)" });
});

module.exports = router;   // ✅ must export router
