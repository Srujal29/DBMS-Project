import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Close,
  InsertDriveFile,
} from '@mui/icons-material';
import api from '../../services/api';

const UploadDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewDialog, setPreviewDialog] = useState({ open: false, document: null });
  const [uploadDialog, setUploadDialog] = useState({ open: false, file: null });
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/my-documents');
      // CORRECTED: Access the .documents property from the response
      setDocuments(response.data.documents || []);
    } catch (err) {
      setError('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadDialog({ open: true, file });
  };

  const handleUpload = async () => {
    if (!uploadDialog.file || !documentType) {
      setError('Please select document type');
      return;
    }

    const formData = new FormData();
    formData.append('document', uploadDialog.file);
    formData.append('documentType', documentType);
    formData.append('description', description);

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/patient/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Document uploaded successfully!');
      fetchDocuments();
      setUploadDialog({ open: false, file: null });
      setDocumentType('');
      setDescription('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      // NOTE: You will need to create this backend endpoint
      await api.delete(`/patient/document/${documentId}`);
      setSuccess('Document deleted successfully!');
      fetchDocuments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete document. Please ensure the backend route is set up.');
    }
  };

  const handlePreview = (document) => {
    // Construct the full URL for the file
    const fileUrl = `http://localhost:5000/${document.filePath.replace(/\\/g, '/')}`;
    setPreviewDialog({ open: true, document: { ...document, fileUrl } });
  };

  const closePreview = () => {
    setPreviewDialog({ open: false, document: null });
  };

  const closeUploadDialog = () => {
    setUploadDialog({ open: false, file: null });
    setDocumentType('');
    setDescription('');
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    return '📎';
  };

  const documentTypes = [
    'X-Ray',
    'Prescription',
    'Lab Report',
    'MRI Scan',
    'CT Scan',
    'Ultrasound',
    'Medical Certificate',
    'Insurance Document',
    'Other',
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              My Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload and manage your medical documents, X-rays, and prescriptions
            </Typography>
          </Box>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            Upload Document
            <input
              type="file"
              hidden
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {documents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <InsertDriveFile sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Documents Uploaded
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Upload your medical documents, X-rays, prescriptions, and lab reports for easy access
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            size="large"
          >
            Upload First Document
            <input
              type="file"
              hidden
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {documents.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {doc.fileType?.startsWith('image/') ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`}
                    alt={doc.fileName}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => handlePreview(doc)}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                      fontSize: 80,
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePreview(doc)}
                  >
                    {getFileIcon(doc.fileType)}
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap gutterBottom>
                    {doc.fileName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {doc.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={doc.documentType || 'Document'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handlePreview(doc)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(doc._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog.open} onClose={closeUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Document
          <IconButton
            onClick={closeUploadDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Selected File:
            </Typography>
            <Chip label={uploadDialog.file?.name} color="primary" />
          </Box>

          <TextField
            select
            fullWidth
            label="Document Type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
            margin="normal"
          >
            {documentTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            margin="normal"
            placeholder="Add any relevant details about this document"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUploadDialog}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || !documentType}
            startIcon={<CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={closePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDialog.document?.fileName}
          <IconButton
            onClick={closePreview}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewDialog.document?.fileType?.startsWith('image/') ? (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={previewDialog.document.fileUrl}
                alt={previewDialog.document.fileName}
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            </Box>
          ) : previewDialog.document?.fileType?.includes('pdf') ? (
            <Box sx={{ height: '70vh' }}>
              <iframe
                src={previewDialog.document.fileUrl}
                width="100%"
                height="100%"
                title={previewDialog.document.fileName}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <InsertDriveFile sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preview not available
              </Typography>
              <Button
                variant="contained"
                href={previewDialog.document?.fileUrl}
                target="_blank"
                download
              >
                Download File
              </Button>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Document Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Type:
                </Typography>
                <Typography variant="body2">
                  {previewDialog.document?.documentType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Uploaded:
                </Typography>
                <Typography variant="body2">
                  {previewDialog.document?.uploadDate &&
                    new Date(previewDialog.document.uploadDate).toLocaleDateString()}
                </Typography>
              </Grid>
              {previewDialog.document?.description && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Description:
                  </Typography>
                  <Typography variant="body2">
                    {previewDialog.document.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            href={previewDialog.document?.fileUrl}
            target="_blank"
            download
          >
            Download
          </Button>
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UploadDocuments;
