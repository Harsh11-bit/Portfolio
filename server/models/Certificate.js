const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: Date, required: true },
  mainImage: { type: String, required: true }, // URL for the main thumbnail image
  additionalImages: [{
    url: { type: String },
    description: { type: String }
  }], // Array of additional images with descriptions
  skills: { type: String }, // Comma-separated list of skills
  additionalDescription: { type: String }, // Extra description
  highlights: [{ type: String }], // Array of highlights
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', CertificateSchema);