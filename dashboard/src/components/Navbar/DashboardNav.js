import React from 'react';
import { NavLink } from 'react-router-dom';
import './DashboardNav.css';

function DashboardNav({ onLogout }) {
  return (
    <nav className="dashboard-nav">
      <div className="nav-container">
        <div className="nav-brand">Dashboard</div>
        <button
          className="nav-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="nav-toggler-icon"></span>
        </button>
        <div className="nav-menu collapse" id="navMenu">
          <ul className="nav-links">
            <li><NavLink to="/" end className="nav-link">Home</NavLink></li>
            <li><NavLink to="/about" className="nav-link">About</NavLink></li>
            <li><NavLink to="/projects" className="nav-link">Projects</NavLink></li>
            <li><NavLink to="/skills" className="nav-link">Skills</NavLink></li>
            <li><NavLink to="/services" className="nav-link">Services</NavLink></li>
            <li><NavLink to="/blog" className="nav-link">Blog</NavLink></li>
            <li><NavLink to="/certificates" className="nav-link">Certificates</NavLink></li>
            <li><NavLink to="/contact" className="nav-link">Contact</NavLink></li>
            <li><NavLink to="/recycle-bin" className="nav-link">Recycle Bin</NavLink></li>
          </ul>
          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNav;