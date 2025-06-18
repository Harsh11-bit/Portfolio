import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AboutManager.css';

function AboutManager() {
  const [abouts, setAbouts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

  const fetchAbouts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/about`);
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setAbouts(data);
    } catch (err) {
      console.error('Error fetching about:', err);
      setMessage('Error fetching about info.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbouts();
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
      if (!formData.title || !formData.description) {
        throw new Error('Title and description are required');
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
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
      // Send existing images to preserve them
      const existingImages = formData.additionalImages
        .filter(img => img.existingUrl && !img.file)
        .map(img => ({ url: img.existingUrl, description: img.description }));
      data.append('existingAdditionalImages', JSON.stringify(existingImages));

      let newAbout;
      if (editingId) {
        const res = await axios.put(`${BASE_URL}/api/about/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newAbout = res.data;
        setAbouts(abouts.map(about => (about._id === editingId ? newAbout : about)));
        setMessage('About updated successfully!');
        setEditingId(null);
      } else {
        const res = await axios.post(`${BASE_URL}/api/about`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newAbout = res.data;
        setAbouts([newAbout, ...abouts]);
        setMessage('About created successfully!');
      }

      setFormData({
        title: '',
        description: '',
        mainImage: null,
        additionalImages: [{ file: null, description: '', existingUrl: '' }],
        additionalDescription: '',
        highlights: [''],
      });
      setMainImagePreview('');
      setAdditionalImagePreviews([]);
    } catch (err) {
      console.error('Error saving about:', err);
      setMessage(`Error saving about: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (about) => {
    setEditingId(about._id);
    const additionalImages = about.additionalImages?.length > 0
      ? about.additionalImages.map(img => ({
          file: null,
          description: img.description || '',
          existingUrl: img.url || '',
        }))
      : [{ file: null, description: '', existingUrl: '' }];
    setFormData({
      title: about.title || '',
      description: about.description || '',
      mainImage: null,
      additionalImages,
      additionalDescription: about.additionalDescription || '',
      highlights: about.highlights?.length > 0 ? about.highlights : [''],
    });
    setMainImagePreview(about.mainImage || '');
    setAdditionalImagePreviews(additionalImages.map(img => img.existingUrl || ''));
  };

  const handleDelete = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/about/${id}`);
      setAbouts(abouts.filter(about => about._id !== id));
      setMessage('About moved to recycle bin!');
    } catch (err) {
      console.error('Error moving about to recycle bin:', err);
      setMessage('Error moving about to recycle bin.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      mainImage: null,
      additionalImages: [{ file: null, description: '', existingUrl: '' }],
      additionalDescription: '',
      highlights: [''],
    });
    setMainImagePreview('');
    setAdditionalImagePreviews([]);
  };

  return (
    <div className="about-manager my-4">
      <h2>{editingId ? 'Edit About' : 'Manage About'}</h2>
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
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
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
          {editingId ? 'Update About' : 'Add About'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isLoading}>
            Cancel
          </button>
        )}
      </form>
      <h3>Existing About Entries</h3>
      {isLoading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="about-grid">
          {abouts.map((about) => (
            <div key={about._id} className="about-card">
              {about.mainImage && (
                <div className="about-image">
                  <img src={about.mainImage} alt={about.title} />
                </div>
              )}
              <div className="about-details">
                <h5>{about.title}</h5>
                <p>{about.description}</p>
                {about.additionalImages?.length > 0 && (
                  <div>
                    {about.additionalImages.map((img, idx) => (
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
                {about.additionalDescription && <p>{about.additionalDescription}</p>}
                {about.highlights?.length > 0 && (
                  <div>
                    {about.highlights.map((highlight, idx) => (
                      <p key={idx}>{highlight}</p>
                    ))}
                  </div>
                )}
                <div className="actions">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(about)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(about._id)}
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

export default AboutManager;