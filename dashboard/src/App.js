import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthManager from './components/Auth/AuthManager';
import DashboardNav from './components/Navbar/DashboardNav';
import AboutManager from './components/About/AboutManager';
import ProjectManager from './components/Project/ProjectManager';
import SkillManager from './components/Skill/SkillManager';
import ServiceManager from './components/Service/ServiceManager';
import BlogManager from './components/Blog/BlogManager';
import ContactManager from './components/Contact/ContactManager';
import CertificateManager from './components/Certificate/CertificateManager';
import RecycleBinManager from './components/RecycleBin/RecycleBinManager';
import Home from './components/Home/Home';
import StartPage from './components/StartPage/StartPage'; // Added: Import StartPage
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [showStartPage, setShowStartPage] = useState(false); // Added: State for StartPage

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    setLoggedIn(isAuthenticated);
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('isAuthenticated', 'true');
    setShowStartPage(true); // Added: Show StartPage after login
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('isAuthenticated');
    setShowStartPage(false); // Added: Reset StartPage on logout
  };

  return (
    <BrowserRouter>
      <div className="container">
        {loggedIn && !showStartPage && <DashboardNav onLogout={handleLogout} />} {/* Modified: Hide DashboardNav during StartPage */}
        <Routes>
          <Route path="/auth" element={<AuthManager onLogin={handleLogin} loggedIn={loggedIn} />} />
          <Route
            path="/"
            element={
              loggedIn ? (
                showStartPage ? (
                  <StartPage onAnimationEnd={() => setShowStartPage(false)} /> // Added: Render StartPage when showStartPage is true
                ) : (
                  <Home />
                )
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/about"
            element={loggedIn ? <AboutManager /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/projects"
            element={loggedIn ? <ProjectManager /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/skills"
            element={loggedIn ? <SkillManager /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/services"
            element={loggedIn ? <ServiceManager /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/blog"
            element={loggedIn ? <BlogManager /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/certificates"
            element={loggedIn ? <CertificateManager /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/contact"
            element={loggedIn ? <ContactManager /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/recycle-bin"
            element={loggedIn ? <RecycleBinManager /> : <Navigate to="/auth" replace />}
          />
          <Route path="*" element={<Navigate to={loggedIn ? "/" : "/auth"} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;