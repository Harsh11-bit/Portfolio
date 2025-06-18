const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const RecycleBin = require('../models/RecycleBin');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skills',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Images only (jpg, png, jpeg)!'));
  },
});

// GET all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json(skills);
  } catch (err) {
    console.error('Error fetching skills:', err.message);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// POST a new skill with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, proficiency, description } = req.body;
    const image = req.file ? req.file.path : '';

    if (!name || !proficiency) {
      return res.status(400).json({ error: 'Name and proficiency are required' });
    }

    const newSkill = new Skill({
      name,
      proficiency,
      description,
      image,
    });
    await newSkill.save();
    res.json(newSkill);
  } catch (err) {
    console.error('Error creating skill:', err.message);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// PUT update skill with image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, proficiency, description } = req.body;
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    let image = skill.image;
    if (req.file) {
      if (image) {
        const publicId = image.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`skills/${publicId}`);
      }
      image = req.file.path;
    }

    const updated = await Skill.findByIdAndUpdate(
      req.params.id,
      {
        name,
        proficiency,
        description,
        image,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating skill:', err.message);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// DELETE a skill
router.delete('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Move to Recycle Bin
    await RecycleBin.create({
      collectionType: 'Skill',
      item: skill.toObject(),
      originalSortField: 'createdAt',
      originalSortValue: skill.createdAt,
    });

    // Delete image from Cloudinary
    if (skill.image) {
      const publicId = skill.image.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`skills/${publicId}`);
    }

    // Delete from Skills
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting skill:', err.message);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

module.exports = router;