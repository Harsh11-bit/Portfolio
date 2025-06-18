// models/RecycleBin.js
const mongoose = require('mongoose');

const RecycleBinSchema = new mongoose.Schema({
  collectionType: { type: String, required: true }, // e.g., 'Project', 'About', 'Blog', etc.
  item: { type: mongoose.Mixed, required: true }, // The deleted item data
  deletedAt: { type: Date, default: Date.now },
  originalSortField: { type: String }, // Field used for sorting (e.g., 'updatedAt', 'createdAt')
  originalSortValue: { type: mongoose.Mixed }, // Value of the sort field at deletion
});

module.exports = mongoose.model('RecycleBin', RecycleBinSchema);