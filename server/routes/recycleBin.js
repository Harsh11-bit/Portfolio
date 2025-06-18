const express = require('express');
const router = express.Router();
const RecycleBin = require('../models/RecycleBin');
const Project = require('../models/Project');
const About = require('../models/About');
const Blog = require('../models/Blog');
const Certificate = require('../models/Certificate');
const Service = require('../models/Service');
const Skill = require('../models/Skill');
const Contact = require('../models/Contact');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const modelMap = {
  Project,
  About,
  Blog,
  Certificate,
  Service,
  Skill,
  Contact,
};

// Get all items in the Recycle Bin
router.get('/', async (req, res) => {
  try {
    const items = await RecycleBin.find().sort({ deletedAt: -1 });
    if (!items || items.length === 0) {
      console.log('Recycle Bin is empty');
      return res.json([]);
    }
    // Sanitize items (remove sensitive fields)
    const sanitizedItems = items.map(item => {
      if (!item.item || !item.collectionType) {
        console.warn('Invalid recycle bin item:', item);
        return null;
      }
      if (item.collectionType === 'Certificate') {
        const { credentialUrl, ...sanitizedItem } = item.item;
        return { ...item.toObject(), item: sanitizedItem };
      }
      return item.toObject();
    }).filter(item => item !== null);
    console.log(`Fetched ${sanitizedItems.length} recycle bin items`);
    res.json(sanitizedItems);
  } catch (err) {
    console.error('Error fetching recycle bin items:', err.message, err.stack);
    res.status(500).json({ error: `Failed to fetch recycle bin items: ${err.message}` });
  }
});

// Restore an item to its original collection
router.post('/restore/:id', async (req, res) => {
  try {
    const recycleItem = await RecycleBin.findById(req.params.id);
    if (!recycleItem) {
      return res.status(404).json({ error: 'Item not found in recycle bin' });
    }

    const Model = modelMap[recycleItem.collectionType];
    if (!Model) {
      return res.status(400).json({ error: `Invalid collection type: ${recycleItem.collectionType}` });
    }

    // Sanitize item for restoration
    let itemData = recycleItem.item;
    if (recycleItem.collectionType === 'Certificate') {
      const { credentialUrl, ...sanitizedItem } = itemData;
      itemData = sanitizedItem;
    }

    // Restore the item
    const restoredItem = new Model(itemData);
    await restoredItem.save();
    console.log(`Restored ${recycleItem.collectionType} with ID ${restoredItem._id}`);

    // Remove from Recycle Bin
    await RecycleBin.findByIdAndDelete(req.params.id);
    console.log(`Removed recycle bin item with ID ${req.params.id}`);

    res.json({ message: `${recycleItem.collectionType} restored successfully` });
  } catch (err) {
    console.error('Error restoring item:', err.message, err.stack);
    res.status(500).json({ error: `Failed to restore item: ${err.message}` });
  }
});

// Permanently delete an item from the Recycle Bin
router.delete('/:id', async (req, res) => {
  try {
    const recycleItem = await RecycleBin.findById(req.params.id);
    if (!recycleItem) {
      return res.status(404).json({ error: 'Item not found in recycle bin' });
    }

    // Delete images from Cloudinary for relevant collections
    const collectionsWithImages = ['Project', 'About', 'Blog', 'Certificate', 'Service', 'Skill'];
    if (collectionsWithImages.includes(recycleItem.collectionType)) {
      const item = recycleItem.item;
      // Delete main image
      if (item.mainImage && item.mainImage.includes('res.cloudinary.com')) {
        try {
          const publicId = item.mainImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`${recycleItem.collectionType.toLowerCase()}/${publicId}`);
          console.log(`Deleted main image: ${recycleItem.collectionType.toLowerCase()}/${publicId}`);
        } catch (cloudErr) {
          console.warn(`Failed to delete main image from Cloudinary: ${cloudErr.message}`);
        }
      }
      // Delete additional images
      for (const img of item.additionalImages || []) {
        if (img.url && img.url.includes('res.cloudinary.com')) {
          try {
            const publicId = img.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`${recycleItem.collectionType.toLowerCase()}/${publicId}`);
            console.log(`Deleted additional image: ${recycleItem.collectionType.toLowerCase()}/${publicId}`);
          } catch (cloudErr) {
            console.warn(`Failed to delete additional image from Cloudinary: ${cloudErr.message}`);
          }
        }
      }
      // Handle Skill image
      if (recycleItem.collectionType === 'Skill' && item.image && item.image.includes('res.cloudinary.com')) {
        try {
          const publicId = item.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`skills/${publicId}`);
          console.log(`Deleted skill image: skills/${publicId}`);
        } catch (cloudErr) {
          console.warn(`Failed to delete skill image from Cloudinary: ${cloudErr.message}`);
        }
      }
    }

    // Delete the item from Recycle Bin
    await RecycleBin.findByIdAndDelete(req.params.id);
    console.log(`Permanently deleted recycle bin item with ID ${req.params.id}`);
    res.json({ message: 'Item permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting item:', err.message, err.stack);
    res.status(500).json({ error: `Failed to permanently delete item: ${err.message}` });
  }
});

module.exports = router;