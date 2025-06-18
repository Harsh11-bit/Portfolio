import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SkillManager.css';

function SkillManager() {
  const [skills, setSkills] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    proficiency: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = 'https://portfolio-9unv.onrender.com';

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/skills`);
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setSkills(data);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setMessage('Error fetching skills.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setMessage('Please upload only JPG, PNG, or JPEG images.');
      return;
    }
    setFormData({ ...formData, image: file });
    setImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!formData.name || !formData.proficiency) {
        throw new Error('Name and proficiency are required');
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('proficiency', formData.proficiency);
      data.append('description', formData.description);
      if (formData.image) {
        data.append('image', formData.image);
      }

      let newSkill;
      if (editingId) {
        const res = await axios.put(`${BASE_URL}/api/skills/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newSkill = res.data;
        setSkills(skills.map(skill => (skill._id === editingId ? newSkill : skill)));
        setMessage('Skill updated successfully!');
        setEditingId(null);
      } else {
        const res = await axios.post(`${BASE_URL}/api/skills`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newSkill = res.data;
        setSkills([newSkill, ...skills]);
        setMessage('Skill created successfully!');
      }

      setFormData({
        name: '',
        proficiency: '',
        description: '',
        image: null,
      });
      setImagePreview('');
    } catch (err) {
      console.error('Error saving skill:', err);
      setMessage(`Error saving skill: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id);
    setFormData({
      name: skill.name || '',
      proficiency: skill.proficiency || '',
      description: skill.description || '',
      image: null,
    });
    setImagePreview(skill.image || '');
  };

  const handleDelete = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/skills/${id}`);
      setSkills(skills.filter(skill => skill._id !== id));
      setMessage('Skill moved to recycle bin!');
    } catch (err) {
      console.error('Error moving skill to recycle bin:', err);
      setMessage('Error moving skill to recycle bin.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      proficiency: '',
      description: '',
      image: null,
    });
    setImagePreview('');
  };

  return (
    <div className="skill-manager my-4">
      <h2>{editingId ? 'Edit Skill' : 'Manage Skills'}</h2>
      {message && <div className="alert alert-info">{message}</div>}
      {isLoading && <p>Loading...</p>}
      <form onSubmit={handleSubmit} className="mb-3" encType="multipart/form-data">
        <div className="mb-2">
          <label>Skill Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-2">
          <label>Proficiency (%)</label>
          <input
            type="number"
            name="proficiency"
            value={formData.proficiency}
            onChange={handleChange}
            className="form-control"
            min="0"
            max="100"
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
            disabled={isLoading}
          />
        </div>
        <div className="mb-2">
          <label>Image</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="form-control"
            accept="image/jpeg,image/jpg,image/png"
            disabled={isLoading}
          />
          {imagePreview && (
            <div>
              <img src={imagePreview} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />
              <p>Current: {imagePreview.split('/').pop()}</p>
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary me-2" disabled={isLoading}>
          {editingId ? 'Update Skill' : 'Add Skill'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={isLoading}>
            Cancel
          </button>
        )}
      </form>
      <h3>Existing Skills</h3>
      {isLoading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="skill-grid">
          {skills.map((skill) => (
            <div key={skill._id} className="skill-card">
              {skill.image && (
                <div className="skill-image">
                  <img src={skill.image} alt={skill.name} />
                </div>
              )}
              <div className="skill-details">
                <h5>{skill.name}</h5>
                <p>Proficiency: {skill.proficiency}%</p>
                {skill.description && <p>{skill.description}</p>}
                <div className="actions">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(skill)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(skill._id)}
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

export default SkillManager;