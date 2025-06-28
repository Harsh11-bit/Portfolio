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
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="splash-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="wave-background"></div>
      
      <motion.div
        className="logo-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <h1 className="pulse-text">HARSH TANDEL</h1>
        <p className="subtitle">Initializing Portfolio</p>
      </motion.div>

      <div className="progress-wrapper">
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        ></motion.div>
        <span className="progress-text">{progress}%</span>
      </div>
    </motion.div>
  );
};

export default StartPage;