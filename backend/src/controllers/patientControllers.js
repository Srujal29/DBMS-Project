const Patient = require("../models/Patient");
const User = require("../models/User");

exports.getMyProfile = async (req, res) => {
  try {
    // req.user.id comes from token
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const patient = await Patient.findById(user.refId);
    if (!patient) return res.status(404).json({ message: "Patient record not found" });

    res.json({ profile: patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
