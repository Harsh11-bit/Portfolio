import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './About.css';

function About() {
  const [about, setAbout] = useState(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/about');
      console.log('API Response (Raw):', res.data);

      let data = res.data;
      let normalizedData = null;

      if (Array.isArray(data) && data.length > 0) {
        normalizedData = data[0];
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        normalizedData = data;
      } else {
        console.warn('No valid about data found:', data);
        setError('No about data available');
        normalizedData = {};
      }

      normalizedData = {
        mainImage: normalizedData?.mainImage || 'https://via.placeholder.com/300',
        title: normalizedData?.title || 'About Me',
        description: normalizedData?.description || 'No description available.',
        additionalDescription: normalizedData?.additionalDescription || '',
        highlights: Array.isArray(normalizedData?.highlights) ? normalizedData.highlights : [],
        additionalImages: Array.isArray(normalizedData?.additionalImages) ? normalizedData.additionalImages : []
      };

      console.log('Normalized Data:', normalizedData);
      setAbout(normalizedData);
    } catch (err) {
      console.error('Error fetching about info:', err.message, err.response?.data);
      setError('Failed to load about information');
      setAbout({
        mainImage: 'https://via.placeholder.com/300',
        title: 'About Me',
        description: 'No description available.',
        additionalDescription: '',
        highlights: [],
        additionalImages: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const openImageModal = (url, description) => {
    setSelectedGalleryImage({ url, description });
  };

  const closeGalleryCard = () => {
    setSelectedGalleryImage(null);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
  };

  if (loading) {
    return (
      <div className="about-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="about-error"><p>{error}</p></div>;
  }

  return (
    <div className="about-container">
      <h1 className="page-title">About Me</h1>
      <div className="about-hero">
        <div className="hero-content">
          <div className="profile-image-container">
            <img
              src={about.mainImage}
              alt="Profile"
              className="profile-image"
            />
            <div className="image-glare"></div>
          </div>
          <div className="hero-text">
            <h1>{about.title}</h1>
            <p className="hero-description">{about.description}</p>
          </div>
        </div>
      </div>

      {about.additionalDescription && (
        <div className="additional-description-section">
          <h2 className="section-title">Additional Details</h2>
          <div className="highlights-grid">
            <div className="highlight-card">
              <div className="highlight-content">
                <p>{about.additionalDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {about.highlights.length > 0 && (
        <div className="highlights-section">
          <h2 className="section-title">Key Highlights</h2>
          <div className="highlights-grid">
            {about.highlights.map((highlight, index) => (
              <div key={index} className="highlight-card" style={{ '--card-index': index + 1 }}>
                <div className="highlight-number">{index + 1}</div>
                <div className="highlight-content">
                  <p>{highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {about.additionalImages.length > 0 && (
        <div className="gallery-section">
          <h2 className="section-title">Gallery</h2>
          <div className="gallery-grid">
            {about.additionalImages.map((img, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openImageModal(img.url || 'https://via.placeholder.com/250', img.description || 'No description')}
              >
                <img src={img.url || 'https://via.placeholder.com/250'} alt={`Gallery ${index}`} />
                {img.description && (
                  <div className="image-overlay">
                    <p className="image-overlay-text">{img.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedGalleryImage && (
        <div className="image-modal" onClick={closeGalleryCard}>
          <div className="modal-content" onClick={handleImageClick}>
            <img
              src={selectedGalleryImage.url}
              alt="Full size"
            />
            <p>{selectedGalleryImage.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default About;