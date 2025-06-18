const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mainImage: { type: String, required: true }, // URL for the main thumbnail image
  additionalImages: [{
    url: { type: String },
    description: { type: String }
  }], // Array of additional images with descriptions
  highlights: [{ type: String }], // Array of highlights
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);