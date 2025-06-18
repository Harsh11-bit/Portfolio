import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BlogManager.css';

function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mainImage: null,
    additionalImages: [{ file: null, description: '', existingUrl: '' }],
    additionalDescription: '',
    highlights: [''],
  });
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = 'https://portfolio-9unv.onrender.com';

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/blog`);
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setBlogs(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setMessage('Error fetching blogs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, mainImage: file });
    setMainImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const handleAdditionalImageChange = (index, field, value) => {
    const newImages = [...formData.additionalImages];
    if (field === 'file') {
      newImages[index].file = value;
      const newPreviews = [...additionalImagePreviews];
      newPreviews[index] = value ? URL.createObjectURL(value) : newImages[index].existingUrl || '';
      setAdditionalImagePreviews(newPreviews);
    } else {
      newImages[index][field] = value;
    }
    setFormData({ ...formData, additionalImages: newImages });
  };

  const addAdditionalImage = () => {
    const newImages = [...formData.additionalImages, { file: null, description: '', existingUrl: '' }];
    setFormData({ ...formData, additionalImages: newImages });
    setAdditionalImagePreviews([...additionalImagePreviews, '']);
  };

  const removeAdditionalImage = (index) => {
    const newImages = formData.additionalImages.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalImages: newImages });
    const newPreviews = additionalImagePreviews.filter((_, i) => i !== index);
    setAdditionalImagePreviews(newPreviews);
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData({ ...formData, highlights: newHighlights });
  };

  const addHighlight = () => {
    setFormData({ ...formData, highlights: [...formData.highlights, ''] });
  };

  const removeHighlight = (index) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!formData.title || !formData.content) {
        throw new Error('Title and content are required');
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      if (formData.mainImage) {
        data.append('mainImage', formData.mainImage);
      }
      const additionalImageDescriptions = formData.additionalImages.map(img => img.description);
      formData.additionalImages.forEach((img, index) => {
        if (img.file) {
          data.append('additionalImages', img.file);
          additionalImageDescriptions[index] = img.description;
        }
      });
      data.append('additionalImageDescriptions', JSON.stringify(additionalImageDescriptions));
      data.append('additionalDescription', formData.additionalDescription);
      data.append('highlights', JSON.stringify(formData.highlights.filter(h => h.trim() !== '')));
      const existingImages = formData.additionalImages
        .filter(img => img.existingUrl && !img.file)
        .map(img => ({ url: img.existingUrl, description: img.description }));
      data.append('existingAdditionalImages', JSON.stringify(existingImages));

      let newBlog;
      if (editingId) {
        const res = await axios.put(`${BASE_URL}/api/blog/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newBlog = res.data;
        setBlogs(blogs.map(blog => (blog._id === editingId ? newBlog : blog)));
        setMessage('Blog updated successfully!');
        setEditingId(null);
      } else {
        const res = await axios.post(`${BASE_URL}/api/blog`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newBlog = res.data;
        setBlogs([newBlog, ...blogs]);
        setMessage('Blog created successfully!');
      }

      setFormData({
        title: '',
        content: '',
        mainImage: null,
        additionalImages: [{ file: null, description: '', existingUrl: '' }],
        additionalDescription: '',
        highlights: [''],
      });
      setMainImagePreview('');
      setAdditionalImagePreviews([]);
    } catch (err) {
      console.error('Error saving blog:', err);
      setMessage(`Error saving blog: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    const additionalImages = blog.additionalImages?.length > 0
      ? blog.additionalImages.map(img => ({
          file: null,
          description: img.description || '',
          existingUrl: img.url || '',
        }))
      : [{ file: null, description: '', existingUrl: '' }];
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      mainImage: null,
      additionalImages,
      additionalDescription: blog.additionalDescription || '',
      highlights: blog.highlights?.length > 0 ? blog.highlights : [''],
    });
    setMainImagePreview(blog.mainImage || '');
    setAdditionalImagePreviews(additionalImages.map(img => img.existingUrl || ''));
  };

  const handleDelete = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/blog/${id}`);
      setBlogs(blogs.filter(blog => blog._id !== id));
      setMessage('Blog moved to recycle bin!');
    } catch (err) {
      console.error('Error moving blog to recycle bin:', err);
      setMessage('Error moving blog to recycle bin.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      mainImage: null,
      additionalImages: [{ file: null, description: '', existingUrl: '' }],
      additionalDescription: '',
      highlights: [''],
    });
    setMainImagePreview('');
    setAdditionalImagePreviews([]);
  };

  return (
    <div className="blog-manager my-4">
      <h2>{editingId ? 'Edit Blog Post' : 'Manage Blog Posts'}</h2>
      {message && <div className="alert alert-info">{message}</div>}
      {isLoading && <p>Loading...</p>}
      <form onSubmit={handleSubmit} className="mb-3" encType="multipart/form-data">
        <div className="mb-2">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-2">
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="form-control"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-2">
          <label>Main Image</label>
          <input
            type="file"
            name="mainImage"
            onChange={handleMainImageChange}
            className="form-control"
            accept="image/*"
            disabled={isLoading}
          />
          {mainImagePreview && (
            <div>
              <img src={mainImagePreview} alt="Main Preview" style={{ width: '100px', marginTop: '10px' }} />
              <p>Current: {mainImagePreview.split('/').pop()}</p>
            </div>
          )}
        </div>
        <div className="mb-2">
          <label>Additional Images</label>
          {formData.additionalImages.map((image, index) => (
            <div key={index} className="mb-2">
              <input
                type="file"
                onChange={(e) => handleAdditionalImageChange(index, 'file', e.target.files[0])}
                className="form-control mb-1"
                accept="image/*"
                disabled={isLoading}
              />
              <textarea
                placeholder="Image Description"
                value={image.description}
                onChange={(e) => handleAdditionalImageChange(index, 'description', e.target.value)}
                className="form-control mb-1"
                disabled={isLoading}
              />
              {additionalImagePreviews[index] && (
                <div>
                  <img
                    src={additionalImagePreviews[index]}
                    alt={`Preview ${index}`}
                    style={{ width: '100px', marginTop: '10px' }}
                  />
                  <p>Current: {additionalImagePreviews[index].split('/').pop()}</p>
                </div>
              )}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeAdditionalImage(index)}
                disabled={isLoading}
              >
                Remove Image
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={addAdditionalImage}
            disabled={isLoading}
          >
            Add Another Image
          </button>
        </div>
        <div className="mb-2">
          <label>Additional Description</label>
          <textarea
            name="additionalDescription"
            value={formData.additionalDescription}
            onChange={handleChange}
            className="form-control"
            disabled={isLoading}
          />
        </div>
        <div className="mb-2">
          <label>Highlights</label>
          {formData.highlights.map((highlight, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => handleHighlightChange(index, e.target.value)}
                className="form-control mb-1"
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeHighlight(index)}
                disabled={formData.highlights.length === 1 || isLoading}
              >
                Remove Highlight
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={addHighlight}
            disabled={isLoading}
          >
            Add Another Highlight
          </button>
        </div>
        <button type="submit" className="btn btn-primary me-2" disabled={isLoading}>
          {editingId ? 'Update Blog' : 'Add Blog'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isLoading}>
            Cancel
          </button>
        )}
      </form>
      <h3>Existing Blog Posts</h3>
      {isLoading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              {blog.mainImage && (
                <div className="blog-image">
                  <img src={blog.mainImage} alt={blog.title} />
                </div>
              )}
              <div className="blog-details">
                <h5>{blog.title}</h5>
                <p>{blog.content}</p>
                {blog.additionalImages?.length > 0 && (
                  <div>
                    {blog.additionalImages.map((img, idx) => (
                      <div key={idx}>
                        <img
                          src={img.url}
                          alt={`Additional ${idx}`}
                          style={{ width: '100px' }}
                        />
                        <p>{img.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {blog.additionalDescription && <p>{blog.additionalDescription}</p>}
                {blog.highlights?.length > 0 && (
                  <div>
                    {blog.highlights.map((highlight, idx) => (
                      <p key={idx}>{highlight}</p>
                    ))}
                  </div>
                )}
                <div className="actions">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(blog)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(blog._id)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogManager;