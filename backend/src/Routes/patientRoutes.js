const express = require("express");
const multer = require('multer');
const { protect, checkRole } = require("../middleware/auth.middleware");
const { getMyProfile, getPatientById } = require("../controllers/patientControllers");

// 1. Import all the document controller functions
const { 
    getMyDocuments, 
    uploadDocument, 
    deleteDocument, 
    getDocumentsForPatient 
} = require("../controllers/documentController");

const router = express.Router();

// 2. Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // IMPORTANT: Ensure you have an 'uploads/' folder in your backend's root directory
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });


// --- Patient-specific Routes (for the logged-in patient) ---
router.get("/my-profile", protect, checkRole(["patient"]), getMyProfile);
router.get("/my-documents", protect, checkRole(["patient"]), getMyDocuments);
router.post("/upload-document", protect, checkRole(["patient"]), upload.single('document'), uploadDocument);
router.delete("/document/:documentId", protect, checkRole(["patient"]), deleteDocument);


// --- Doctor-specific Routes (for accessing another patient's data) ---
router.get("/:patientId", protect, checkRole(["doctor"]), getPatientById);
// This route allows a doctor to get all documents for a specific patient
router.get("/:patientId/documents", protect, checkRole(["doctor"]), getDocumentsForPatient);


module.exports = router;

