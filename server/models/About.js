const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mainImage: { type: String }, // URL for the main thumbnail image
  additionalImages: [{
    url: { type: String },
    description: { type: String }
  }], // Array of additional images with descriptions
  additionalDescription: { type: String }, // Extra description field
  highlights: [{ type: String }], // Array of highlights or key points
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('About', AboutSchema);