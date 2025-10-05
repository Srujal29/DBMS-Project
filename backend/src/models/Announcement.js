const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  targetRoles: {
    type: [String],
    enum: ['all', 'patient', 'doctor'],
    default: ['all'],
  },
}, {
  timestamps: true, // This adds the 'createdAt' field for sorting
});

module.exports = mongoose.model('Announcement', announcementSchema);

