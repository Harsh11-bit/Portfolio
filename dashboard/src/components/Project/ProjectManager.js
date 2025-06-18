import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectManager.css';

function ProjectManager() {
  const [projects, setProjects] = useState([]); // Fixed syntax error
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainImage: null,
    additionalImages: [{ file: null, description: '', existingUrl: '' }],
    technologies: '',
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

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/projects`);
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setMessage('Error fetching projects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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
      if (!formData.title || !formData.description) {
        throw new Error('Title and description are required');
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('technologies', formData.technologies);
      if (formData.mainImage) {
        data.append('mainImage', formData.mainImage);
      }
      const additionalImageDescriptions = formData.additionalImages.map(img => img.description);
      formData.additionalImages.forEach((img, index) => {
        if (img.file) {
          data.append('additionalImages', img.file);
        }
      });
      data.append('additionalImageDescriptions', JSON.stringify(additionalImageDescriptions));
      data.append('additionalDescription', formData.additionalDescription);
      data.append('highlights', JSON.stringify(formData.highlights.filter(h => h.trim() !== '')));
      const existingImages = formData.additionalImages
        .filter(img => img.existingUrl)
        .map(img => ({ url: img.existingUrl, description: img.description }));
      data.append('existingAdditionalImages', JSON.stringify(existingImages));

      let newProject;
      if (editingId) {
        const res = await axios.put(`${BASE_URL}/api/projects/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newProject = res.data;
        setProjects(projects.map(project => (project._id === editingId ? newProject : project)));
        setMessage('Project updated successfully!');
        setEditingId(null);
      } else {
        const res = await axios.post(`${BASE_URL}/api/projects`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newProject = res.data;
        setProjects([newProject, ...projects]);
        setMessage('Project created successfully!');
      }

      setFormData({
        title: '',
        description: '',
        mainImage: null,
        additionalImages: [{ file: null, description: '', existingUrl: '' }],
        technologies: '',
        additionalDescription: '',
        highlights: [''],
      });
      setMainImagePreview('');
      setAdditionalImagePreviews([]);
    } catch (err) {
      console.error('Error saving project:', err);
      setMessage(`Error saving project: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    const additionalImages = project.additionalImages?.length > 0
      ? project.additionalImages.map(img => ({
          file: null,
          description: img.description || '',
          existingUrl: img.url || '',
        }))
      : [{ file: null, description: '', existingUrl: '' }];
    setFormData({
      title: project.title || '',
      description: project.description || '',
      mainImage: null,
      additionalImages,
      technologies: project.technologies || '',
      additionalDescription: project.additionalDescription || '',
      highlights: project.highlights?.length > 0 ? project.highlights : [''],
    });
    setMainImagePreview(project.mainImage || '');
    setAdditionalImagePreviews(additionalImages.map(img => img.existingUrl || ''));
  };

  const handleDelete = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/projects/${id}`);
      setProjects(projects.filter(project => project._id !== id));
      setMessage('Project moved to recycle bin!');
    } catch (err) {
      console.error('Error moving project to recycle bin:', err);
      setMessage('Error moving project to recycle bin.');
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
      technologies: '',
      additionalDescription: '',
      highlights: [''],
    });
    setMainImagePreview('');
    setAdditionalImagePreviews([]);
  };

  return (
    <div className="project-manager my-4">
      <h2>{editingId ? 'Edit Project' : 'Manage Projects'}</h2>
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
          <label>Technologies</label>
          <input
            type="text"
            name="technologies"
            value={formData.technologies}
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
          {editingId ? 'Update Project' : 'Add Project'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isLoading}>
            Cancel
          </button>
        )}
      </form>
      <h3>Existing Projects</h3>
      {isLoading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              {project.mainImage && (
                <div className="project-image">
                  <img src={project.mainImage} alt={project.title} />
                </div>
              )}
              <div className="project-details">
                <h5>{project.title}</h5>
                <p>{project.description}</p>
                {project.technologies && <p><strong>Technologies:</strong> {project.technologies}</p>}
                {project.additionalImages?.length > 0 && (
                  <div>
                    {project.additionalImages.map((img, idx) => (
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
                {project.additionalDescription && <p>{project.additionalDescription}</p>}
                {project.highlights?.length > 0 && (
                  <div>
                    {project.highlights.map((highlight, idx) => (
                      <p key={idx}>{highlight}</p>
                    ))}
                  </div>
                )}
                <div className="actions">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(project)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(project._id)}
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

export default ProjectManager;