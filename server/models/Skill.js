const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: { type: String, required: true }, // e.g., "80%" or "Expert"
  image: { type: String }, // URL for the uploaded skill image
  description: { type: String }, // Optional description field
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Skill', SkillSchema);