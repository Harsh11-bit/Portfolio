import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Services.css';

function Services() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const containerRef = useRef(null);
  const BASE_URL = 'https://portfolio-9unv.onrender.com';

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/services`);
      setServices(res.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  useEffect(() => {
    fetchServices();
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
  }, [services]);

  const handleCardClick = (service) => {
    setSelectedService(service);
  };

  const closeDetailedView = () => {
    setSelectedService(null);
  };

  return (
    <div className="services">
      <h2>My Services</h2>
      <div className="projects-grid" ref={containerRef}>
        {services.map((service) => (
          <div key={service._id} className="card-wrapper">
            <div className="project-card" onClick={() => handleCardClick(service)}>
              <div className="card-image-container">
                {service.mainImage && (
                  <img
                    src={service.mainImage}
                    className="card-image"
                    alt={service.title || 'Service Image'}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
              </div>
              <div className="card-overlay">
                <h5>{service.title}</h5>
                {service.description && (
                  <p className="description">{service.description.substring(0, 100)}...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedService && (
        <div className="detailed-view">
          <div className="detailed-content">
            <button className="close-btn" onClick={closeDetailedView}>×</button>
            <div className="detailed-image-container">
              {selectedService.mainImage && (
                <img
                  src={selectedService.mainImage}
                  alt={selectedService.title || 'Service Image'}
                  className="detailed-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              )}
            </div>
            <h3>{selectedService.title}</h3>
            <p>{selectedService.description}</p>
            {selectedService.highlights?.length > 0 && (
              <div>
                <h4>Highlights</h4>
                <ul>
                  {selectedService.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedService.additionalImages?.length > 0 && (
              <div className="additional-images">
                <h4>Additional Images</h4>
                <div className="additional-images-grid">
                  {selectedService.additionalImages.map((img, idx) => (
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

export default Services;