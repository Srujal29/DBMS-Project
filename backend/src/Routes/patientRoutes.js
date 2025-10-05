const express = require("express");
const multer = require('multer');
const { protect, checkRole } = require("../middleware/auth.middleware");
const { getMyProfile, getPatientById } = require("../controllers/patientControllers");
// Import the NEW document controller function
const { 
    getMyDocuments, 
    uploadDocument, 
    deleteDocument,
    getPatientDocuments // <-- NEW IMPORT
} = require("../controllers/documentController");

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Use a unique name to prevent collisions
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`); 
    },
});
const upload = multer({ storage: storage });

// --- Specific Patient Routes (for the patient role) ---
router.get("/my-profile", protect, checkRole(["patient"]), getMyProfile);
router.get("/my-documents", protect, checkRole(["patient"]), getMyDocuments);
router.post("/upload-document", protect, checkRole(["patient"]), upload.single('document'), uploadDocument);
router.delete("/document/:documentId", protect, checkRole(["patient"]), deleteDocument);

// --- NEW Route for Doctor to fetch Documents for a patient (specific ID route) ---
// This MUST come before the generic '/:patientId' route below!
router.get("/documents/:patientId", protect, checkRole(["doctor"]), getPatientDocuments); 

// --- Generic Doctor Route (for patient profile details) ---
// This route should come last to prevent it from incorrectly matching routes like /document/123
router.get("/:patientId", protect, checkRole(["doctor"]), getPatientById);

module.exports = router;
