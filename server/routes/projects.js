const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
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
    folder: 'projects',
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
    console.error(`Invalid file type: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Images only (jpg, png, jpeg)!'), false);
  },
});

// Middleware to handle Multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// GET all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST a new project with image uploads
router.post('/', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), handleMulterError, async (req, res) => {
  try {
    const { title, description, technologies, additionalDescription, highlights, additionalImageDescriptions } = req.body;
    const mainImage = req.files.mainImage ? req.files.mainImage[0].path : '';
    const additionalImages = req.files.additionalImages
      ? req.files.additionalImages.map((file, index) => ({
          url: file.path,
          description: additionalImageDescriptions
            ? JSON.parse(additionalImageDescriptions)[index] || ''
            : '',
        }))
      : [];

    const newProject = new Project({
      title,
      description,
      mainImage,
      additionalImages,
      technologies,
      additionalDescription,
      highlights: JSON.parse(highlights || '[]'),
    });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    console.error('Error creating project:', err.message);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT (update) a project with image uploads
router.put('/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), handleMulterError, async (req, res) => {
  try {
    const { title, description, technologies, additionalDescription, highlights, additionalImageDescriptions, existingAdditionalImages } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Handle main image
    let mainImage = project.mainImage;
    if (req.files.mainImage) {
      if (mainImage) {
        const publicId = mainImage.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`projects/${publicId}`);
      }
      mainImage = req.files.mainImage[0].path;
    }

    // Handle additional images
    const existingImages = existingAdditionalImages ? JSON.parse(existingAdditionalImages) : [];
    const newAdditionalImages = req.files.additionalImages
      ? req.files.additionalImages.map((file, index) => ({
          url: file.path,
          description: additionalImageDescriptions
            ? JSON.parse(additionalImageDescriptions)[index] || ''
            : '',
        }))
      : [];

    // Merge existing and new images
    const additionalImages = [...existingImages, ...newAdditionalImages];

    // Delete unreferenced images
    for (const oldImg of project.additionalImages) {
      if (!additionalImages.some(img => img.url === oldImg.url)) {
        const publicId = oldImg.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`projects/${publicId}`);
      }
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        mainImage,
        additionalImages,
        technologies,
        additionalDescription,
        highlights: JSON.parse(highlights || '[]'),
        updatedAt: Date.now(),
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating project:', err.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Move to Recycle Bin
    await RecycleBin.create({
      collectionType: 'Project',
      item: project.toObject(),
      originalSortField: 'updatedAt',
      originalSortValue: project.updatedAt,
    });

    // Delete images from Cloudinary
    if (project.mainImage) {
      const publicId = project.mainImage.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`projects/${publicId}`);
    }
    for (const img of project.additionalImages) {
      if (img.url) {
        const publicId = img.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`projects/${publicId}`);
      }
    }

    // Delete from Projects
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting project:', err.message);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;