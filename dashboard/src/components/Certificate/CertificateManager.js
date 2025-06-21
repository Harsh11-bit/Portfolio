import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CertificateManager.css';

function CertificateManager() {
  const [certificates, setCertificates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    mainImage: null,
    additionalImages: [{ file: null, description: '', existingUrl: '' }],
    skills: '',
    additionalDescription: '',
    highlights: [''],
  });
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = 'https://portfolio-9unv.onrender.com';

  const validateFile = (file) => {
    if (!file) return true; // Allow empty file for edits
    const filetypes = /\.(jpe?g|png)$/i;
    return filetypes.test(file.name);
  };

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/certificates`);
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setCertificates(data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setMessage('Error fetching certificates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !validateFile(file)) {
      setMessage('Main image must be a JPG or PNG file.');
      return;
    }
    setFormData({ ...formData, mainImage: file });
    setMainImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const handleAdditionalImageChange = (index, field, value) => {
    const newImages = [...formData.additionalImages];
    if (field === 'file') {
      if (value && !validateFile(value)) {
        setMessage(`Additional image ${index + 1} must be a JPG or PNG file.`);
        return;
      }
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
      if (!formData.title || !formData.issuingOrganization || !formData.issueDate) {
        throw new Error('Title, issuing organization, and issue date are required');
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('issuingOrganization', formData.issuingOrganization);
      data.append('issueDate', formData.issueDate);
      data.append('skills', formData.skills);
      if (formData.mainImage) {
        data.append('mainImage', formData.mainImage);
      }

      // Prepare additional images and descriptions
      const additionalImageDescriptions = [];
      const existingImages = [];
      formData.additionalImages.forEach((img, index) => {
        if (img.file) {
          data.append(`additionalImages`, img.file); // Append each file
          additionalImageDescriptions.push(img.description || '');
        } else if (img.existingUrl) {
          existingImages.push({ url: img.existingUrl, description: img.description || '' });
          additionalImageDescriptions.push(img.description || '');
        }
      });

      data.append('additionalImageDescriptions', JSON.stringify(additionalImageDescriptions));
      data.append('existingAdditionalImages', JSON.stringify(existingImages));
      data.append('additionalDescription', formData.additionalDescription);
      data.append('highlights', JSON.stringify(formData.highlights.filter(h => h.trim() !== '')));

      let newCertificate;
      if (editingId) {
        const res = await axios.put(`${BASE_URL}/api/certificates/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newCertificate = res.data;
        setCertificates(certificates.map(cert => (cert._id === editingId ? newCertificate : cert)));
        setMessage('Certificate updated successfully!');
        setEditingId(null);
      } else {
        const res = await axios.post(`${BASE_URL}/api/certificates`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newCertificate = res.data;
        setCertificates([newCertificate, ...certificates]);
        setMessage('Certificate created successfully!');
      }

      setFormData({
        title: '',
        issuingOrganization: '',
        issueDate: '',
        mainImage: null,
        additionalImages: [{ file: null, description: '', existingUrl: '' }],
        skills: '',
        additionalDescription: '',
        highlights: [''],
      });
      setMainImagePreview('');
      setAdditionalImagePreviews([]);
    } catch (err) {
      console.error('Error saving certificate:', err);
      setMessage(`Error saving certificate: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (certificate) => {
    setEditingId(certificate._id);
    const additionalImages = certificate.additionalImages?.length > 0
      ? certificate.additionalImages.map(img => ({
          file: null,
          description: img.description || '',
          existingUrl: img.url || '',
        }))
      : [{ file: null, description: '', existingUrl: '' }];
    setFormData({
      title: certificate.title || '',
      issuingOrganization: certificate.issuingOrganization || '',
      issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : '',
      mainImage: null,
      additionalImages,
      skills: certificate.skills || '',
      additionalDescription: certificate.additionalDescription || '',
      highlights: certificate.highlights?.length > 0 ? certificate.highlights : [''],
    });
    setMainImagePreview(certificate.mainImage || '');
    setAdditionalImagePreviews(additionalImages.map(img => img.existingUrl || ''));
  };

  const handleDelete = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/certificates/${id}`);
      setCertificates(certificates.filter(cert => cert._id !== id));
      setMessage('Certificate moved to recycle bin!');
    } catch (err) {
      console.error('Error moving certificate to recycle bin:', err);
      setMessage('Error moving certificate to recycle bin.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      issuingOrganization: '',
      issueDate: '',
      mainImage: null,
      additionalImages: [{ file: null, description: '', existingUrl: '' }],
      skills: '',
      additionalDescription: '',
      highlights: [''],
    });
    setMainImagePreview('');
    setAdditionalImagePreviews([]);
  };

  return (
    <div className="certificate-manager my-4">
      <h2>{editingId ? 'Edit Certificate' : 'Manage Certificates'}</h2>
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
          <label>Issuing Organization</label>
          <input
            type="text"
            name="issuingOrganization"
            value={formData.issuingOrganization}
            onChange={handleChange}
            className="form-control"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-2">
          <label>Issue Date</label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="form-control"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-2">
          <label>Skills</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="form-control"
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
            accept="image/jpeg,image/png"
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
                accept="image/jpeg,image/png"
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
          {editingId ? 'Update Certificate' : 'Add Certificate'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isLoading}>
            Cancel
          </button>
        )}
      </form>
      <h3>Existing Certificates</h3>
      {isLoading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="certificate-grid">
          {certificates.map((certificate) => (
            <div key={certificate._id} className="certificate-card">
              {certificate.mainImage && (
                <div className="certificate-image">
                  <img src={certificate.mainImage} alt={certificate.title} />
                </div>
              )}
              <div className="certificate-details">
                <h5>{certificate.title}</h5>
                <p><strong>Organization:</strong> {certificate.issuingOrganization}</p>
                <p><strong>Issue Date:</strong> {new Date(certificate.issueDate).toLocaleDateString()}</p>
                {certificate.skills && <p><strong>Skills:</strong> {certificate.skills}</p>}
                {certificate.additionalImages?.length > 0 && (
                  <div>
                    {certificate.additionalImages.map((img, idx) => (
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
                {certificate.additionalDescription && <p>{certificate.additionalDescription}</p>}
                {certificate.highlights?.length > 0 && (
                  <div>
                    {certificate.highlights.map((highlight, idx) => (
                      <p key={idx}>{highlight}</p>
                    ))}
                  </div>
                )}
                <div className="actions">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(certificate)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(certificate._id)}
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

export default CertificateManager;