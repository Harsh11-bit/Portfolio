const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Remove after migration: app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Connect to MongoDB
const mongoURI = 'mongodb+srv://tandel:Harsh%401109@cluster0.e0pxpes.mongodb.net/';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Import routes
const authRoutes = require('./routes/auth');
const aboutRoutes = require('./routes/about');
const projectRoutes = require('./routes/projects');
const serviceRoutes = require('./routes/services');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contacts');
const certificateRoutes = require('./routes/certificates');
const skillRoutes = require('./routes/skills');
const recycleBinRoutes = require('./routes/recycleBin');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/recycle-bin', recycleBinRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});