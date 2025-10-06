const Document = require('../models/Document');
const User = require('../models/User');
const fs = require('fs');
const path = require('path'); // For path manipulation

// Helper to create the public file URL
const mapDocumentToPublicUrl = (req, doc) => {
    // Assuming 'filePath' is 'uploads/timestamp-filename.ext'
    const fileName = path.basename(doc.filePath);
    return {
        ...doc.toObject(),
        // Construct the full public URL for the file access
        fileUrl: `${req.protocol}://${req.get('host')}/uploads/${fileName}`,
        uploadedAt: doc.uploadDate, // Use uploadDate as uploadedAt for consistency
    };
};

// Get all documents for the logged-in patient
exports.getMyDocuments = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Ensure user is found and has the necessary refId
        if (!user || !user.refId) {
             return res.status(401).json({ message: 'User reference not found.' });
        }
        
        const documents = await Document.find({ patient_id: user.refId }).sort({ uploadDate: -1 });

        const documentsWithUrl = documents.map(doc => mapDocumentToPublicUrl(req, doc));
        
        res.json({ documents: documentsWithUrl });
    } catch (err) {
        console.error("Error fetching patient's own documents:", err);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

// Upload a new document (UPDATED to include documentType and description)
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file was uploaded.' });
        }
        
        const { documentType, description } = req.body;
        if (!documentType) {
             return res.status(400).json({ message: 'Document type is required.' });
        }
        
        const user = await User.findById(req.user.id);

        const newDocument = new Document({
            patient_id: user.refId,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            // New fields captured from the form
            documentType, 
            description,
        });

        await newDocument.save();
        
        const responseDocument = mapDocumentToPublicUrl(req, newDocument);

        res.status(201).json({ message: 'Document uploaded successfully', document: responseDocument });
    } catch (err) {
        console.error("Error during document upload:", err);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};

// Delete a document (for the patient)
exports.deleteDocument = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { documentId } = req.params;

        // Find the document to ensure it belongs to the logged-in patient
        const document = await Document.findOne({ _id: documentId, patient_id: user.refId });

        if (!document) {
            return res.status(404).json({ message: "Document not found or you are not authorized to delete it." });
        }

        // Delete the physical file from the 'uploads' folder
        fs.unlink(document.filePath, (err) => {
            if (err) {
                console.error("Error deleting physical file:", err);
            }
        });

        // Remove the document record from the database
        await Document.deleteOne({ _id: documentId });

        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error("Error during document deletion:", err);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};

// Get all documents for a specific patient (for the doctor)
exports.getDocumentsForPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Fetch documents using the patient's refId (assuming patientId IS the refId)
        const documents = await Document.find({ patient_id: patientId }).sort({ uploadDate: -1 });
        
        // Map to include the public URL
        const documentsWithUrl = documents.map(doc => mapDocumentToPublicUrl(req, doc));

        res.json({ documents: documentsWithUrl });
    } catch (err) {
        console.error("Doctor failed to fetch patient documents:", err);
        res.status(500).json({ error: 'Failed to fetch patient documents' });
    }
};

