const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  skills: [String],
  city: {
    type: String,
    required: true
  },
  workType: {
    type: String,
    enum: ['remote', 'office', 'hybrid'],
    default: 'office'
  },
  salary: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'closed', 'rejected'],
    default: 'pending'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
