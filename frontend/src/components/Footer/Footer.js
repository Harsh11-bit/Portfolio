import React, { useState, useEffect } from 'react';
import './Footer.css';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if user is at the bottom of the page (within 50px)
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      setIsAtBottom(isBottom);
      // Hide footer if not at bottom
      if (!isBottom) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = () => {
    if (isAtBottom) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="footer-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
 <br></br>
      <footer className={`footer ${isVisible && isAtBottom ? 'visible' : ''}`}>
        <p>© {new Date().getFullYear()} Harsh Tandel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Footer;