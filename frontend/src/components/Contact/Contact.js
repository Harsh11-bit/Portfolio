import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Contact.css';

function Contact() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    message: ''
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: initialEmail
    }));
  }, [initialEmail]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('https://portfolio-9unv.onrender.com/api/contacts', formData);
      setSuccessMsg("Thank you for contacting us! We'll get back to you soon.");
      setErrorMsg('');
      setIsSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
      }, 1000);
    } catch (err) {
      console.error('Error submitting contact form', err);
      setErrorMsg("Submission failed. Please try again later.");
      setSuccessMsg('');
      setIsSubmitted(false);
    }
  };

  return (
    <div className="contact-page">
      <h2 className="contact-title">Contact Me</h2>
      <div className="contact-container">
        <div className={`contact-wrapper ${isSubmitted ? 'submitted' : ''}`}>
          <div className="get-in-touch-card">
            <div className="content-overlay">
              <h2>Get in Touch</h2>
              <p className="animated-text">Let's create something amazing together!</p>
              <div className="sparkle-container">
                <div className="sparkle"></div>
                <div className="sparkle"></div>
                <div className="sparkle"></div>
              </div>
            </div>
          </div>
          <div className="contact-card-wrapper">
            {!successMsg && (
              <div className="contact-card">
                {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      name="message"
                      className="form-control"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      rows="5"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        {successMsg && (
          <div className={`thank-you-card ${isSubmitted ? 'visible' : ''}`}>
            <h3>🎉 Thank You! 🎉</h3>
            <p>{successMsg}</p>
            <div className="success-animation"></div>
          </div>
        )}
      </div>
      
    </div>
  );
}

export default Contact;