import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './DashboardNav.css';

function DashboardNav({ onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="dashboard-nav">
      <div className="nav-container">
        <div className="nav-brand">Dashboard</div>
        <button
          className="nav-toggler"
          type="button"
          onClick={handleToggle}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="nav-toggler-icon"></span>
        </button>
        <div className={`nav-menu collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className="nav-link" onClick={handleLinkClick}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="nav-link" onClick={handleLinkClick}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects" className="nav-link" onClick={handleLinkClick}>
                Projects
              </NavLink>
            </li>
            <li>
              <NavLink to="/skills" className="nav-link" onClick={handleLinkClick}>
                Skills
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className="nav-link" onClick={handleLinkClick}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className="nav-link" onClick={handleLinkClick}>
                Blog
              </NavLink>
            </li>
            <li>
              <NavLink to="/certificates" className="nav-link" onClick={handleLinkClick}>
                Certificates
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="nav-link" onClick={handleLinkClick}>
                Contact
              </NavLink>
            </li>
            <li>
              <NavLink to="/recycle-bin" className="nav-link" onClick={handleLinkClick}>
                Recycle Bin
              </NavLink>
            </li>
          </ul>
          <button className="nav-logout" onClick={() => { onLogout(); handleLinkClick(); }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNav;