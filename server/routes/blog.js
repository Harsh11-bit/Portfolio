const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
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
    folder: 'blog',
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
    cb(new Error('Error: Images only (jpg, png)!'));
  },
});

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err.message);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// POST a new blog with image uploads
router.post('/', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), async (req, res) => {
  try {
    const { title, content, additionalDescription, highlights, additionalImageDescriptions } = req.body;
    const mainImage = req.files.mainImage ? req.files.mainImage[0].path : '';
    const additionalImages = req.files.additionalImages
      ? req.files.additionalImages.map((file, index) => ({
          url: file.path,
          description: additionalImageDescriptions
            ? JSON.parse(additionalImageDescriptions)[index] || ''
            : '',
        }))
      : [];

    const newBlog = new Blog({
      title,
      content,
      mainImage,
      additionalImages,
      additionalDescription,
      highlights: JSON.parse(highlights || '[]'),
    });
    await newBlog.save();
    res.json(newBlog);
  } catch (err) {
    console.error('Error creating blog:', err.message);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT update blog with image uploads
router.put('/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), async (req, res) => {
  try {
    const { title, content, additionalDescription, highlights, additionalImageDescriptions, existingAdditionalImages } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Handle main image
    let mainImage = blog.mainImage;
    if (req.files.mainImage) {
      if (mainImage) {
        const publicId = mainImage.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`blog/${publicId}`);
      }
      mainImage = req.files.mainImage[0].path;
    }

    // Handle additional images
    let existingImages = existingAdditionalImages ? JSON.parse(existingAdditionalImages) : [];
    let newAdditionalImages = req.files.additionalImages
      ? req.files.additionalImages.map((file, index) => ({
          url: file.path,
          description: additionalImageDescriptions
            ? JSON.parse(additionalImageDescriptions)[index] || ''
            : '',
        }))
      : [];

    // Merge existing images with new ones
    let additionalImages = [...existingImages];
    // Only delete images that are no longer in the existingImages list
    for (const oldImg of blog.additionalImages) {
      if (!existingImages.some(img => img.url === oldImg.url) && !newAdditionalImages.some(img => img.url === oldImg.url)) {
        const publicId = oldImg.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`blog/${publicId}`);
      }
    }
    // Append new images
    additionalImages = [...existingImages, ...newAdditionalImages];

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        mainImage,
        additionalImages,
        additionalDescription,
        highlights: JSON.parse(highlights || '[]'),
        createdAt: Date.now(),
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating blog:', err.message);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE a blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Move to Recycle Bin
    await RecycleBin.create({
      collectionType: 'Blog',
      item: blog.toObject(),
      originalSortField: 'createdAt',
      originalSortValue: blog.createdAt,
    });

    // Delete images from Cloudinary
    if (blog.mainImage) {
      const publicId = blog.mainImage.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`blog/${publicId}`);
    }
    for (const img of blog.additionalImages) {
      if (img.url) {
        const publicId = img.url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`blog/${publicId}`);
      }
    }

    // Delete from Blogs
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog post moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting blog:', err.message);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

module.exports = router;