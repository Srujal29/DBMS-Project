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

router.post('/register-admin', async (req, res) => {
  try {
    const { name, username, password, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new User({
      name,
      username,
      password: hashedPassword,
      email,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;   // ✅ must export router
