const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// register
exports.register = async (req, res) => {
  try {
    const { username, password, role, name, age, gender, contact, specialization, experience } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let refDoc;
    if (role === "patient") {
      refDoc = await Patient.create({ name, age, gender, contact });
    } else if (role === "doctor") {
      refDoc = await Doctor.create({ name, specialization, experience, contact });
    }

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      refId: refDoc._id,
      roleRef: role === "patient" ? "Patient" : "Doctor",
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// logout (frontend side ka kaam hota hai, backend me bas token invalidate karna hota hai)
exports.logout = (req, res) => {
  res.json({ message: "Logout successful (remove token from client)" });
};
