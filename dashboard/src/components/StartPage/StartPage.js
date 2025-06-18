import React, { useEffect } from 'react';
import './StartPage.css';

const StartPage = ({ onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 3000); // 3 seconds, matching CSS progress animation

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className="start-page">
      <div className="loader-container">
        <div className="cyber-circle">
          <div className="cyber-core"></div>
        </div>
        <div className="cyber-grid">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="grid-cell"></div>
          ))}
        </div>
        <div className="cyber-text">
          <h1>HARSH TANDEL</h1>
          <p>PORTFOLIO DASHBOARD</p>
          <div className="cyber-line"></div>
        </div>
        <div className="cyber-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;