// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './components/Home/Home';
import About from './components/About/About';
import Projects from './components/Projects/Projects';
import Skills from './components/Skill/Skills';
import Services from './components/Services/Services';
import Blog from './components/Blog/Blog';
import Contact from './components/Contact/Contact';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Certificates from './components/Certificates/Certificates';
import StartPage from './components/StartPage/StartPage';
import './App.css';

function App() {
  const [showStartPage, setShowStartPage] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStartPage(false);
    }, 5000); // Show start page for 5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      <AnimatePresence mode='wait'>
        {showStartPage ? (
          <StartPage key="start-page" />
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar />
            <main className="content">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/services" element={<Services />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;