const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
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
    folder: 'certificates',
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

// GET all certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ issueDate: -1 });
    res.json(certificates);
  } catch (err) {
    console.error('Error fetching certificates:', err.message);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// POST a new certificate with image uploads
router.post('/', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), handleMulterError, async (req, res) => {
  try {
    const { title, issuingOrganization, issueDate, skills, additionalDescription, highlights, additionalImageDescriptions } = req.body;
    const mainImage = req.files.mainImage ? req.files.mainImage[0].path : '';

    // Parse additional image descriptions
    let descriptions = [];
    try {
      descriptions = additionalImageDescriptions ? JSON.parse(additionalImageDescriptions) : [];
    } catch (err) {
      console.error('Error parsing additionalImageDescriptions:', err);
    }

    // Handle additional images
    const additionalImages = req.files.additionalImages
      ? req.files.additionalImages.map((file, index) => ({
          url: file.path,
          description: descriptions[index] || '',
        }))
      : [];

    const newCertificate = new Certificate({
      title,
      issuingOrganization,
      issueDate,
      mainImage,
      additionalImages,
      skills,
      additionalDescription,
      highlights: JSON.parse(highlights || '[]'),
    });
    await newCertificate.save();
    res.json(newCertificate);
  } catch (err) {
    console.error('Error creating certificate:', err.message);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// PUT update certificate with image uploads
router.put('/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), handleMulterError, async (req, res) => {
  try {
    const { title, issuingOrganization, issueDate, skills, additionalDescription, highlights, additionalImageDescriptions, existingAdditionalImages } = req.body;
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Handle main image
    let mainImage = certificate.mainImage;
    if (req.files.mainImage) {
      if (mainImage) {
        const publicId = mainImage.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`certificates/${publicId}`);
      }
      mainImage = req.files.mainImage[0].path;
    }

    // Parse additional image descriptions and existing images
    let descriptions = [];
    let existingImages = [];
    try {
      descriptions = additionalImageDescriptions ? JSON.parse(additionalImageDescriptions) : [];
      existingImages = existingAdditionalImages ? JSON.parse(existingAdditionalImages) : [];
    } catch (err) {
      console.error('Error parsing JSON fields:', err);
    }

    // Handle new additional images
    const newAdditionalImages = req.files.additionalImages
      ? req.files.additionalImages.map((file, index) => ({
          url: file.path,
          description: descriptions[existingImages.length + index] || '',
        }))
      : [];

    // Merge existing and new images
    const additionalImages = [...existingImages, ...newAdditionalImages];

    // Delete unreferenced images
    for (const oldImg of certificate.additionalImages) {
      if (!additionalImages.some(img => img.url === oldImg.url)) {
        const publicId = oldImg.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`certificates/${publicId}`);
      }
    }

    const updated = await Certificate.findByIdAndUpdate(
      req.params.id,
      {
        title,
        issuingOrganization,
        issueDate,
        mainImage,
        additionalImages,
        skills,
        additionalDescription,
        highlights: JSON.parse(highlights || '[]'),
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating certificate:', err.message);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// DELETE a certificate
router.delete('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Move to RecycleBin
    await RecycleBin.create({
      collectionType: 'Certificate',
      item: certificate.toObject(),
      originalSortField: 'issueDate',
      originalSortValue: certificate.issueDate,
    });

    // Delete images from Cloudinary
    if (certificate.mainImage) {
      const publicId = certificate.mainImage.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`certificates/${publicId}`);
    }
    for (const img of certificate.additionalImages) {
      if (img.url) {
        const publicId = img.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`certificates/${publicId}`);
      }
    }

    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certificate moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting certificate:', err.message);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

module.exports = router;