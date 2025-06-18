import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Blog.css';

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const containerRef = useRef(null);
  const location = useLocation();
  const BASE_URL = 'https://portfolio-9unv.onrender.com';

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/blog`);
      setBlogs(res.data);
    } catch (err) {
      console.error('Error fetching blogs', err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const blogId = params.get('blogId');
    if (blogId && blogs.length > 0) {
      const blog = blogs.find((b) => b._id === blogId);
      if (blog) {
        setSelectedBlog(blog);
      }
    }
  }, [blogs, location.search]);

  useEffect(() => {
    if (containerRef.current) {
      const handleScroll = () => {
        const cards = containerRef.current.querySelectorAll('.project-card');
        const viewportHeight = window.innerHeight;
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;
          const distanceFromCenter = Math.abs(viewportCenter - cardCenter);
          const maxDistance = viewportHeight / 2;

          const progress = Math.max(0, 1 - distanceFromCenter / maxDistance);
          const scale = 0.9 + progress * 0.1;
          const opacity = 0.6 + progress * 0.4;
          const rotateX = (distanceFromCenter / maxDistance) * 8 * (cardCenter < viewportCenter ? 1 : -1);

          card.style.transform = `perspective(1000px) scale(${scale}) rotateX(${rotateX}deg)`;
          card.style.opacity = opacity;
          card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
          card.parentElement.style.setProperty('--index', index + 1);
        });
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [blogs]);

  const handleCardClick = (blog) => {
    setSelectedBlog(blog);
  };

  const closeDetailedView = () => {
    setSelectedBlog(null);
  };

  return (
    <div className="blog">
      <h2>My Blog</h2>
      <div className="projects-grid" ref={containerRef}>
        {blogs.map((blog) => (
          <div key={blog._id} className="card-wrapper">
            <div className="project-card" onClick={() => handleCardClick(blog)}>
              <div className="card-image-container">
                {blog.mainImage && (
                  <img
                    src={blog.mainImage}
                    className="card-image"
                    alt={blog.title || 'Blog Image'}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
              </div>
              <div className="card-overlay">
                <h5>{blog.title}</h5>
                {blog.content && (
                  <p className="description">{blog.content.substring(0, 100)}...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedBlog && (
        <div className="detailed-view">
          <div className="detailed-content">
            <button className="close-btn" onClick={closeDetailedView}>×</button>
            <div className="detailed-image-container">
              {selectedBlog.mainImage && (
                <img
                  src={selectedBlog.mainImage}
                  alt={selectedBlog.title || 'Blog Image'}
                  className="detailed-image"
                  onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                />
              )}
            </div>
            <h3>{selectedBlog.title}</h3>
            <p>{selectedBlog.content}</p>
            {selectedBlog.additionalDescription && (
              <p>{selectedBlog.additionalDescription}</p>
            )}
            {selectedBlog.highlights && selectedBlog.highlights.length > 0 && (
              <div>
                <h4>Highlights</h4>
                <ul>
                  {selectedBlog.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedBlog.additionalImages && selectedBlog.additionalImages.length > 0 && (
              <div className="additional-images">
                <h4>Additional Images</h4>
                <div className="additional-images-grid">
                  {selectedBlog.additionalImages.map((img, idx) => (
                    <div key={idx} className="additional-image">
                      <img
                        src={img.url}
                        alt={`Additional ${idx}`}
                        className="additional-image-img"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <p>{img.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Blog;