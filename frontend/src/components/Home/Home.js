import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaCode, FaLaptopCode, FaPenFancy } from 'react-icons/fa';
import './Home.css';

function Home() {
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [profession, setProfession] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [teaserEmail, setTeaserEmail] = useState('');
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const [projectsRes, blogsRes, skillsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/projects`),
          axios.get(`${BASE_URL}/api/blog`),
          axios.get(`${BASE_URL}/api/skills`),
        ]);
        setProjects(projectsRes.data);
        setBlogs(blogsRes.data);
        setSkills(skillsRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching content:', err);
        setProjects([]);
        setBlogs([]);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const professions = ['Developer', 'Designer', 'Innovator'];
    let index = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeProfession = () => {
      const currentWord = professions[index];
      setProfession(currentWord.substring(0, charIndex));
      if (!isDeleting) {
        charIndex++;
        if (charIndex > currentWord.length) {
          isDeleting = true;
          setTimeout(typeProfession, 1000);
        } else {
          setTimeout(typeProfession, 150);
        }
      } else {
        charIndex--;
        if (charIndex < 0) {
          isDeleting = false;
          index = (index + 1) % professions.length;
          setTimeout(typeProfession, 500);
        } else {
          setTimeout(typeProfession, 100);
        }
      }
    };

    typeProfession();

    const welcomeText = 'Welcome to my portfolio!';
    let welcomeCharIndex = 0;
    let isWelcomeDeleting = false;

    const typeWelcome = () => {
      setWelcomeMessage(welcomeText.substring(0, welcomeCharIndex));
      if (!isWelcomeDeleting) {
        welcomeCharIndex++;
        if (welcomeCharIndex > welcomeText.length) {
          isWelcomeDeleting = true;
          setTimeout(typeWelcome, 1000);
        } else {
          setTimeout(typeWelcome, 150);
        }
      } else {
        welcomeCharIndex--;
        if (welcomeCharIndex < 0) {
          isWelcomeDeleting = false;
          setTimeout(typeWelcome, 500);
        } else {
          setTimeout(typeWelcome, 100);
        }
      }
    };

    typeWelcome();
  }, []);

  useEffect(() => {
    if (blogs.length > 0) {
      const newGroups = [];
      for (let i = 0; i < blogs.length; i += 3) {
        newGroups.push(blogs.slice(i, i + 3));
      }
      setGroups(newGroups);
    }
  }, [blogs]);

  useEffect(() => {
    if (groups.length > 0) {
      const interval = setInterval(() => {
        setCurrentGroupIndex((prevIndex) => (prevIndex + 1) % groups.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [groups]);

  const handleProjectClick = (project) => {
    navigate(`/projects?projectId=${project._id}`);
  };

  const handleBlogClick = (blog) => {
    navigate(`/blog?blogId=${blog._id}`);
  };

  const handleSkillClick = (skill) => {
    navigate(`/skills?skillId=${skill._id}`);
  };

  const handleTeaserEmailChange = (e) => {
    setTeaserEmail(e.target.value);
  };

  const handleScrollDown = () => {
    document.querySelector('.skills-section').scrollIntoView({ behavior: 'smooth' });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const skillCardVariants = {
    hover: { y: -10, rotateX: 5, rotateY: 5, scale: 1.05, transition: { duration: 0.3 } },
  };

  const contentCardVariants = {
    hover: { y: -10, rotateY: 10, transition: { duration: 0.3 } },
  };

  return (
    <div id="home" className="home">
      <div className="welcome-message">
        <span className="welcome-text">{welcomeMessage}</span>
        <div className="welcome-underline"></div>
      </div>

      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              <span className="normal-text">Hi, I'm </span>
              <span className="highlight">Harsh Tandel</span>
            </h1>
            <div className="profession-container">
              <span className="profession">{profession}</span>
              <div className="profession-underline"></div>
            </div>
            <p className="hero-subtitle">
              Crafting digital experiences with a futuristic touch
            </p>
            <div className="hero-buttons">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.5 }}>
                <Link to="/projects" className="btn btn-primary">
                  View My Work
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/about" className="btn btn-secondary">
                  About Me
                </Link>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="hero-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="image-container">
              <img
                src="https://cdn.wallpapersafari.com/77/9/uGel7T.jpg"
                alt="Harsh Tandel"
                className="profile-image"
              />
              <div className="image-glow"></div>
            </div>
          </motion.div>
        </div>
        <div className="social-links">
          <a
            href="https://github.com/Harsh11-bit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub className="social-icon" />
          </a>
          <a
            href="https://www.linkedin.com/in/harshtandel11/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin className="social-icon" />
          </a>
          <a href="mailto:tandelh009@gmail.com" aria-label="Email">
            <FaEnvelope className="social-icon" />
          </a>
        </div>
        <div className="scroll-indicator" onClick={handleScrollDown} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && handleScrollDown()}>
          <div className="mouse">
            <div className="scroller"></div>
          </div>
          <span>Scroll Down</span>
        </div>
      </section>

      <motion.section
        className="skills-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="section-header">
          <FaCode className="section-icon" />
          <h2>Main Skills</h2>
        </div>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : skills.length === 0 ? (
          <p>No skills available.</p>
        ) : (
          <>
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill._id}
                  className="skill-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover="hover"
                  variants={skillCardVariants}
                  onClick={() => handleSkillClick(skill)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleSkillClick(skill)}
                >
                  <svg className="skill-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="url(#iconGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="url(#iconGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="url(#iconGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#00eaff', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#00aaff', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <h3>{skill.name}</h3>
                  <div className="skill-progress-container">
                    <span className="skill-progress-value">{skill.proficiency}%</span>
                    <div className="skill-progress-bar">
                      <motion.div
                        className="skill-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.proficiency}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="view-all-button">
              <Link to="/skills" className="btn btn-secondary">
                View All Skills
              </Link>
            </div>
          </>
        )}
      </motion.section>

      <motion.section
        className="projects-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="section-header">
          <FaLaptopCode className="section-icon" />
          <h2>All Projects</h2>
        </div>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : projects.length === 0 ? (
          <p>No projects available.</p>
        ) : (
          <div className="projects-slider">
            <div className="projects-track">
              {[...projects, ...projects, ...projects].map((project, index) => (
                <motion.div
                  key={`${project._id}-${index}`}
                  className="mirror-card project-card"
                  whileHover="hover"
                  variants={contentCardVariants}
                  onClick={() => handleProjectClick(project)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleProjectClick(project)}
                >
                  <div className="mirror-overlay"></div>
                  <div className="project-image">
                    <img
                      src={project.mainImage || '/images/placeholder.jpg'}
                      alt={project.title || 'Project Image'}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <div className="project-overlay">
                      <h3>{project.title}</h3>
                      <p>
                        {project.description.length > 100
                          ? `${project.description.substring(0, 100)}...`
                          : project.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      <motion.section
        className="blog-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="section-header">
          <FaPenFancy className="section-icon" />
          <h2>All Articles</h2>
        </div>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : groups.length === 0 ? (
          <p>No blogs available.</p>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentGroupIndex}
                className="blog-grid"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
              >
                {groups[currentGroupIndex].map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    className="mirror-card blog-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover="hover"
                    variants={contentCardVariants}
                    onClick={() => handleBlogClick(blog)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleBlogClick(blog)}
                  >
                    <div className="mirror-overlay"></div>
                    <div className="blog-image">
                      <img
                        src={blog.mainImage || '/images/placeholder.jpg'}
                        alt={blog.title || 'Blog Image'}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="blog-overlay">
                        <h3>{blog.title}</h3>
                        <p>{blog.content.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            <div className="view-all-button">
              <Link to="/blog" className="btn btn-secondary">
                View All Blogs
              </Link>
            </div>
          </>
        )}
      </motion.section>

      <motion.section
        className="contact-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="section-header">
          <FaEnvelope className="section-icon" />
          <h2>Get In Touch</h2>
        </div>
        <div className="contact-content">
          <motion.div
            className="contact-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Ready to start your project?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Let's create something amazing together. Reach out to discuss your ideas!
            </motion.p>
            <motion.div
              className="contact-methods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a href="mailto:tandelh009@gmail.com" className="contact-link">
                <FaEnvelope /> tandelh009@gmail.com
              </a>
            </motion.div>
          </motion.div>
          <motion.div
            className="contact-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="form-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="form-input"
                value={teaserEmail}
                onChange={handleTeaserEmailChange}
                aria-label="Email address"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to={`/contact?email=${encodeURIComponent(teaserEmail)}`}
                className="btn btn-primary"
              >
                Send Message
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;