import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const navItemsRef = useRef([]);
  const navbarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    closeMenu();
  };

  useEffect(() => {
    const overlay = document.getElementById('overlay');
    if (menuActive) {
      overlay.classList.replace('overlay-slide-left', 'overlay-slide-right');
      animateNavItems('out', 'in');
      document.body.classList.add('navbar-open');
    } else {
      overlay.classList.replace('overlay-slide-right', 'overlay-slide-left');
      animateNavItems('in', 'out');
      document.body.classList.remove('navbar-open');
    }
  }, [menuActive]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuActive &&
        navbarRef.current &&
        hamburgerRef.current &&
        !navbarRef.current.contains(event.target) &&
        !hamburgerRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [menuActive]);

  const animateNavItems = (from, to) => {
    navItemsRef.current.forEach((nav, i) => {
      if (nav) {
        nav.classList.replace(`slide-${from}-${i + 1}`, `slide-${to}-${i + 1}`);
      }
    });
  };

  return (
    <>
      <div
        id="hamburger-menu"
        className={`hamburger-menu ${menuActive ? 'active' : ''}`}
        onClick={toggleMenu}
        ref={hamburgerRef}
      >
        <div className="menu-bar1"></div>
        <div className="menu-bar2"></div>
        <div className="menu-bar3"></div>
      </div>

      <div
        id="overlay"
        className="overlay overlay-slide-left"
        ref={navbarRef}
      >
        <nav>
          <ul>
            {['Home', 'About', 'Projects', 'Skills', 'Certificates', 'Services', 'Blog', 'Contact'].map((text, i) => {
              const path = `/${text.toLowerCase() === 'home' ? '' : text.toLowerCase()}`;
              const isActive = location.pathname === path;
              return (
                <li
                  key={text}
                  id={`nav-${i + 1}`}
                  ref={el => (navItemsRef.current[i] = el)}
                  className={`slide-out-${i + 1} center ${isActive ? 'active-item' : ''}`}
                >
                  <Link
                    to={path}
                    className="center"
                    onClick={(e) => handleLinkClick(e, path)}
                  >
                    {text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;