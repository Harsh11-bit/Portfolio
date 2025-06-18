const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
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
    folder: 'services',
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

// GET all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ updatedAt: -1 });
    res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err.message);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST a new service with image uploads
router.post('/', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), handleMulterError, async (req, res) => {
  try {
    const { title, description, highlights, additionalImageDescriptions } = req.body;
    const mainImage = req.files.mainImage ? req.files.mainImage[0].path : '';
    const additionalImages = req.files.additionalImages
      ? req.files.additionalImages.map((file, index) => ({
          url: file.path,
          description: additionalImageDescriptions
            ? JSON.parse(additionalImageDescriptions)[index] || ''
            : '',
        }))
      : [];

    const newService = new Service({
      title,
      description,
      mainImage,
      additionalImages,
      highlights: JSON.parse(highlights || '[]'),
    });
    await newService.save();
    res.json(newService);
  } catch (err) {
    console.error('Error creating service:', err.message);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT update service with image uploads
router.put('/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), handleMulterError, async (req, res) => {
  try {
    const { title, description, highlights, additionalImageDescriptions, existingAdditionalImages } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Handle main image
    let mainImage = service.mainImage;
    if (req.files.mainImage) {
      if (mainImage) {
        const publicId = mainImage.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`services/${publicId}`);
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
    for (const oldImg of service.additionalImages) {
      if (!additionalImages.some(img => img.url === oldImg.url)) {
        const publicId = oldImg.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`services/${publicId}`);
      }
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        mainImage,
        additionalImages,
        highlights: JSON.parse(highlights || '[]'),
        updatedAt: Date.now(),
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating service:', err.message);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE a service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Move to RecycleBin
    await RecycleBin.create({
      collectionType: 'Service',
      item: service.toObject(),
      originalSortField: 'updatedAt',
      originalSortValue: service.updatedAt,
    });

    // Delete images from Cloudinary
    if (service.mainImage) {
      const publicId = service.mainImage.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }
    for (const img of service.additionalImages) {
      if (img.url) {
        const publicId = img.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`services/${publicId}`);
      }
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting service:', err.message);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;