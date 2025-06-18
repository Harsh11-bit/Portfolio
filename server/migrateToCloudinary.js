const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/portfolioDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const About = require('./models/About');
const Blog = require('./models/Blog');
const Certificate = require('./models/Certificate');
const Project = require('./models/Project');
const Service = require('./models/Service');
const Skill = require('./models/Skill');
const RecycleBin = require('./models/RecycleBin');

async function migrateImages() {
  try {
    // Helper function to upload image to Cloudinary
    async function uploadImage(filePath, folder) {
      if (fs.existsSync(filePath)) {
        const result = await cloudinary.uploader.upload(filePath, {
          folder,
          public_id: path.basename(filePath, path.extname(filePath)),
        });
        console.log(`Uploaded ${filePath} to ${result.secure_url}`);
        return result.secure_url;
      }
      return null;
    }

    // Migrate About
    const about = await About.findOne();
    if (about) {
      if (about.mainImage && about.mainImage.startsWith('/Uploads')) {
        const filePath = path.join(__dirname, about.mainImage.replace('/Uploads', 'Uploads'));
        about.mainImage = await uploadImage(filePath, 'about') || about.mainImage;
      }
      for (const img of about.additionalImages) {
        if (img.url && img.url.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, img.url.replace('/Uploads', 'Uploads'));
          img.url = await uploadImage(filePath, 'about') || img.url;
        }
      }
      await about.save();
      console.log('About migration complete');
    }

    // Migrate Blogs
    const blogs = await Blog.find();
    for (const blog of blogs) {
      if (blog.mainImage && blog.mainImage.startsWith('/Uploads')) {
        const filePath = path.join(__dirname, blog.mainImage.replace('/Uploads', 'Uploads'));
        blog.mainImage = await uploadImage(filePath, 'blog') || blog.mainImage;
      }
      for (const img of blog.additionalImages) {
        if (img.url && img.url.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, img.url.replace('/Uploads', 'Uploads'));
          img.url = await uploadImage(filePath, 'blog') || img.url;
        }
      }
      await blog.save();
    }
    console.log('Blog migration complete');

    // Migrate Certificates
    const certificates = await Certificate.find();
    for (const cert of certificates) {
      if (cert.mainImage && cert.mainImage.startsWith('/Uploads')) {
        const filePath = path.join(__dirname, cert.mainImage.replace('/Uploads', 'Uploads'));
        cert.mainImage = await uploadImage(filePath, 'certificates') || cert.mainImage;
      }
      for (const img of cert.additionalImages) {
        if (img.url && img.url.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, img.url.replace('/Uploads', 'Uploads'));
          img.url = await uploadImage(filePath, 'certificates') || img.url;
        }
      }
      await cert.save();
    }
    console.log('Certificate migration complete');

    // Migrate Projects
    const projects = await Project.find();
    for (const project of projects) {
      if (project.mainImage && project.mainImage.startsWith('/Uploads')) {
        const filePath = path.join(__dirname, project.mainImage.replace('/Uploads', 'Uploads'));
        project.mainImage = await uploadImage(filePath, 'projects') || project.mainImage;
      }
      for (const img of project.additionalImages) {
        if (img.url && img.url.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, img.url.replace('/Uploads', 'Uploads'));
          img.url = await uploadImage(filePath, 'projects') || img.url;
        }
      }
      await project.save();
    }
    console.log('Project migration complete');

    // Migrate Services
    const services = await Service.find();
    for (const service of services) {
      if (service.mainImage && service.mainImage.startsWith('/Uploads')) {
        const filePath = path.join(__dirname, service.mainImage.replace('/Uploads', 'Uploads'));
        service.mainImage = await uploadImage(filePath, 'services') || service.mainImage;
      }
      for (const img of service.additionalImages) {
        if (img.url && img.url.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, img.url.replace('/Uploads', 'Uploads'));
          img.url = await uploadImage(filePath, 'services') || img.url;
        }
      }
      await service.save();
    }
    console.log('Service migration complete');

    // Migrate Skills
    const skills = await Skill.find();
    for (const skill of skills) {
      if (skill.image && skill.image.startsWith('/Uploads')) {
        const filePath = path.join(__dirname, skill.image.replace('/Uploads', 'Uploads'));
        skill.image = await uploadImage(filePath, 'skills') || skill.image;
      }
      await skill.save();
    }
    console.log('Skill migration complete');

    // Migrate RecycleBin
    const recycleItems = await RecycleBin.find();
    for (const item of recycleItems) {
      if (['Project', 'About', 'Blog', 'Certificate', 'Service'].includes(item.collectionType)) {
        if (item.item.mainImage && item.item.mainImage.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, item.item.mainImage.replace('/Uploads', 'Uploads'));
          item.item.mainImage = await uploadImage(filePath, item.collectionType.toLowerCase()) || item.item.mainImage;
        }
        for (const img of item.item.additionalImages || []) {
          if (img.url && img.url.startsWith('/Uploads')) {
            const filePath = path.join(__dirname, img.url.replace('/Uploads', 'Uploads'));
            img.url = await uploadImage(filePath, item.collectionType.toLowerCase()) || img.url;
          }
        }
      }
      if (item.collectionType === 'Skill') {
        if (item.item.image && item.item.image.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, item.item.image.replace('/Uploads', 'Uploads'));
          item.item.image = await uploadImage(filePath, 'skills') || item.item.image;
        }
        if (item.item.iconUrl && item.item.iconUrl.startsWith('/Uploads')) {
          const filePath = path.join(__dirname, item.item.iconUrl.replace('/Uploads', 'Uploads'));
          item.item.image = await uploadImage(filePath, 'skills') || item.item.image;
          delete item.item.iconUrl;
        }
      }
      await item.save();
    }
    console.log('RecycleBin migration complete');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

migrateImages();