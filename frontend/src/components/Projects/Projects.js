import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const containerRef = useRef(null);
  const location = useLocation();

  const BASE_URL = 'http://localhost:5000';

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/projects`);
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('projectId');
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p._id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projects, location.search]);

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
  }, [projects]);

  const handleCardClick = (project) => {
    setSelectedProject(project);
  };

  const closeDetailedView = () => {
    setSelectedProject(null);
  };

  return (
    <div className="projects">
      <h2>My Projects</h2>
      <div className="projects-grid" ref={containerRef}>
        {projects.map((proj) => (
          <div key={proj._id} className="card-wrapper">
            <div className="project-card" onClick={() => handleCardClick(proj)}>
              <div className="card-image-container">
                {proj.mainImage && (
                  <img
                    src={proj.mainImage}
                    className="card-image"
                    alt={proj.title || 'Project Image'}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
              </div>
              <div className="card-overlay">
                <h5>{proj.title}</h5>
                {proj.technologies && (
                  <p className="technologies">
                    <small>Tech: {proj.technologies}</small>
                  </p>
                )}
                {proj.description && (
                  <p className="description">{proj.description.substring(0, 100)}...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedProject && (
        <div className="detailed-view">
          <div className="detailed-content">
            <button className="close-btn" onClick={closeDetailedView}>×</button>
            <div className="detailed-image-container">
              {selectedProject.mainImage && (
                <img
                  src={selectedProject.mainImage}
                  alt={selectedProject.title || 'Project Image'}
                  className="detailed-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              )}
            </div>
            <h3>{selectedProject.title}</h3>
            <p>{selectedProject.description}</p>
            {selectedProject.technologies && (
              <p className="technologies">
                <small>Technologies: {selectedProject.technologies}</small>
              </p>
            )}
            {selectedProject.additionalDescription && (
              <p>{selectedProject.additionalDescription}</p>
            )}
            {selectedProject.highlights?.length > 0 && (
              <div>
                <h4>Highlights</h4>
                <ul>
                  {selectedProject.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedProject.additionalImages?.length > 0 && (
              <div className="additional-images">
                <h4>Additional Images</h4>
                <div className="additional-images-grid">
                  {selectedProject.additionalImages.map((img, idx) => (
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

export default Projects;