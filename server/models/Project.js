const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mainImage: { type: String }, // URL for the main thumbnail image
  additionalImages: [{
    url: { type: String },
    description: { type: String }
  }], // Array of additional images with descriptions
  technologies: { type: String }, // Comma-separated list of technologies
  additionalDescription: { type: String }, // Extra description
  highlights: [{ type: String }], // Array of highlights
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);