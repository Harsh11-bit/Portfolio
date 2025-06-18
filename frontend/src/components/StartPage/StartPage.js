// components/StartPage/StartPage.js
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './StartPage.css';

const StartPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="start-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="cyberpunk-loader">
        <div className="cyberpunk-cube">
          <div className="face front"></div>
          <div className="face back"></div>
          <div className="face right"></div>
          <div className="face left"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      </div>

      <motion.div
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="neon-text">HARSH TANDEL</h1>
        <p className="cyberpunk-subtitle">INITIALIZING SYSTEM</p>
      </motion.div>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <span className="progress-text">{progress}%</span>
      </div>

      <div className="cyberpunk-grid"></div>
    </motion.div>
  );
};

export default StartPage;