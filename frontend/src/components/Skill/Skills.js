import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Skills.css';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const containerRef = useRef(null);
  const location = useLocation();

  const BASE_URL = 'http://localhost:5000';

  const fetchSkills = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/skills`);
      setSkills(res.data);
    } catch (err) {
      console.error('Error fetching skills', err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const skillId = params.get('skillId');
    if (skillId && skills.length > 0) {
      const skill = skills.find((s) => s._id === skillId);
      if (skill) {
        setSelectedSkill(skill);
      }
    }
  }, [skills, location.search]);

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
  }, [skills]);

  const handleCardClick = (skill) => {
    setSelectedSkill(skill);
  };

  const closeDetailedView = () => {
    setSelectedSkill(null);
  };

  return (
    <div className="skills">
      <h2>My Skills</h2>
      <div className="projects-grid" ref={containerRef}>
        {skills.map((skill) => (
          <div key={skill._id} className="card-wrapper">
            <div className="project-card" onClick={() => handleCardClick(skill)}>
              <div className="card-image-container">
                {skill.image && (
                  <img
                    src={skill.image}
                    className="card-image"
                    alt={skill.name || 'Skill Image'}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
              </div>
              <div className="card-overlay">
                <h5>{skill.name}</h5>
                {skill.proficiency && (
                  <p className="proficiency">
                    <small>Proficiency: {skill.proficiency}%</small>
                  </p>
                )}
                {skill.description && (
                  <p className="description">{skill.description.substring(0, 100)}...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedSkill && (
        <div className="detailed-view">
          <div className="detailed-content">
            <button className="close-btn" onClick={closeDetailedView}>×</button>
            <div className="detailed-image-container">
              {selectedSkill.image && (
                <img
                  src={selectedSkill.image}
                  alt={selectedSkill.name || 'Skill Image'}
                  className="detailed-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              )}
            </div>
            <h3>{selectedSkill.name}</h3>
            <p>Proficiency: {selectedSkill.proficiency}%</p>
            {selectedSkill.description && <p>Description: {selectedSkill.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Skills;