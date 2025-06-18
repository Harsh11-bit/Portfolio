import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Certificates.css';

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const containerRef = useRef(null);
  const BASE_URL = 'https://portfolio-9unv.onrender.com';

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/certificates`);
      setCertificates(res.data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const handleScroll = () => {
        const cards = containerRef.current.querySelectorAll('.project-card');
        const viewportHeight = window.innerHeight;
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;
          const distanceFromCenter = Math.abs(viewportCenter - cardCenter);
          const maxDistance = viewportHeight / 2;

          const progress = Math.max(0, 1 - distanceFromCenter / maxDistance);
          const scale = 0.9 + progress * 0.1;
          const opacity = 0.6 + progress * 0.4;
          const rotateX = (distanceFromCenter / maxDistance) * 8 * (cardCenter < viewportCenter ? 1 : -1);

          card.style.transform = `perspective(1000px) scale(${scale}) rotateX(${rotateX}deg)`;
          card.style.opacity = opacity;
          card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
          card.parentElement.style.setProperty('--index', index + 1);
        });
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [certificates]);

  const handleCardClick = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const closeDetailedView = () => {
    setSelectedCertificate(null);
  };

  return (
    <div className="certificates">
      <h2>My Certificates</h2>
      <div className="projects-grid" ref={containerRef}>
        {certificates.map((cert) => (
          <div key={cert._id} className="card-wrapper">
            <div className="project-card" onClick={() => handleCardClick(cert)}>
              <div className="card-image-container">
                {cert.mainImage && (
                  <img
                    src={cert.mainImage}
                    className="card-image"
                    alt={cert.title || 'Certificate Image'}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
              </div>
              <div className="card-overlay">
                <h5>{cert.title}</h5>
                {cert.issuingOrganization && (
                  <p className="organization">
                    <small>Issued by: {cert.issuingOrganization}</small>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedCertificate && (
        <div className="detailed-view">
          <div className="detailed-content">
            <button className="close-btn" onClick={closeDetailedView}>×</button>
            <div className="detailed-image-container">
              {selectedCertificate.mainImage && (
                <img
                  src={selectedCertificate.mainImage}
                  alt={selectedCertificate.title || 'Certificate Image'}
                  className="detailed-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              )}
            </div>
            <h3>{selectedCertificate.title}</h3>
            <p><strong>Issuing Organization:</strong> {selectedCertificate.issuingOrganization}</p>
            <p><strong>Issue Date:</strong> {new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
            {selectedCertificate.skills && (
              <div>
                <h4>Skills</h4>
                <div className="skills">
                  {selectedCertificate.skills.split(',').map((skill, i) => (
                    <span key={i} className="skill-badge">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedCertificate.additionalDescription && (
              <p>{selectedCertificate.additionalDescription}</p>
            )}
            {selectedCertificate.highlights?.length > 0 && (
              <div>
                <h4>Highlights</h4>
                <ul>
                  {selectedCertificate.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCertificate.additionalImages?.length > 0 && (
              <div className="additional-images">
                <h4>Additional Images</h4>
                <div className="additional-images-grid">
                  {selectedCertificate.additionalImages.map((img, idx) => (
                    <div key={idx} className="additional-image">
                      <img
                        src={img.url}
                        alt={`Additional ${idx}`}
                        className="additional-image-img"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <p>{img.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificates;