const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  mainImage: { type: String }, // URL for the main thumbnail image
  additionalImages: [{
    url: { type: String },
    description: { type: String }
  }], // Array of additional images with descriptions
  additionalDescription: { type: String }, // Extra description
  highlights: [{ type: String }], // Array of highlights
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);