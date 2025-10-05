const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// register
exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      role,
      name,
      gender,
      contact,
      dob,
      address,
      specialization,
    } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // 2. Strict validation based on User Schema (only patient and doctor allowed)
    if (!["patient", "doctor"].includes(role)) {
      return res
        .status(400)
        .json({
          message:
            'Invalid role specified. Only "patient" or "doctor" registrations are supported by the schema.',
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;
    let token;

    // Since role is guaranteed to be "patient" or "doctor" by the check above,
    // we only need one main registration block.
    if (role === "patient" || role === "doctor") {
      let refDoc = null;
      let refId = null;
      let roleRef = null;

      if (role === "patient") {
        refDoc = await Patient.create({
          name,
          gender,
          contact_no: contact,
          dob: dob,
          address: address,
        });
        refId = refDoc._id;
        roleRef = "Patient";
      } else if (role === "doctor") {
        refDoc = await Doctor.create({
          name,
          specialization,
          contact_no: contact,
        });
        refId = refDoc._id;
        roleRef = "Doctor";
      }

      // Create User with associated reference document.
      // refId and roleRef are correctly set here, satisfying the 'required' constraint.
      newUser = await User.create({
        username,
        password: hashedPassword,
        role,
        refId: refId,
        roleRef: roleRef,
      });
    }

    // 3. Generate token for immediate login
    if (newUser) {
      token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    } else {
      return res.status(400).json({ message: "User creation failed." });
    }

    res
      .status(201)
      .json({ message: "User registered successfully", token, user: newUser });
  } catch (err) {
    // Check if the error is a validation failure from the database
    if (err.name === "ValidationError") {
      // This means the submitted data violates the Mongoose Schema (e.g., missing required fields, invalid enum)
      console.error("Mongoose Validation Error:", err.message);
      // Return a 400 Bad Request to the client
      return res
        .status(400)
        .json({ error: "Validation Failed: " + err.message });
    }

    console.error("Registration Error:", err);
    res.status(500).json({ error: "Server Error: " + err.message });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// logout
exports.logout = (req, res) => {
  res.json({ message: "Logout successful (remove token from client)" });
};

// NEW: registerAdmin function modified to perform a FIXED ADMIN LOGIN for manual testing
exports.registerAdmin = async (req, res) => {
  try {
    const FIXED_USERNAME = "rootadmin";
    const FIXED_PASSWORD_PLAINTEXT = "password123";

    const { username, password } = req.body;

    // Check if the client is sending the fixed credentials
    if (username === FIXED_USERNAME && password === FIXED_PASSWORD_PLAINTEXT) {
      // If the fixed credentials are used, we perform a login check.
      const admin = await User.findOne({ username: FIXED_USERNAME });

      if (!admin) {
        // Fails if the fixed admin user hasn't been created manually in the DB
        return res
          .status(404)
          .json({
            message: `Admin user '${FIXED_USERNAME}' not found. Please create it manually in the database first (e.g., using MongoDB Compass).`,
          });
      }

      // Generate token using the fetched admin user's details
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Successfully logged in as the fixed admin user
      return res.json({
        message: "Admin login successful (fixed bypass)",
        token,
        user: admin,
      });
    }

    // --- Fallback to original registration attempt (will fail Mongoose validation) ---
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    } // Hash password

    const hashedPassword = await bcrypt.hash(password, 10); // Create admin user (will fail Mongoose validation due to required fields and role enum)

    const admin = new User({
      name: req.body.name, // assuming name is in the body
      username,
      password: hashedPassword,
      email: req.body.email, // assuming email is in the body
      role: "admin",
    });

    await admin.save(); // Generate token for immediate access

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(201)
      .json({ message: "Admin user created successfully", token, user: admin });
  } catch (error) {
    console.error("Admin Login/Registration Error:", error.message);
    const statusCode = error.name === "ValidationError" ? 400 : 500;
    res
      .status(statusCode)
      .json({
        message: "Server error during Admin operation",
        error: error.message,
      });
  }
};
