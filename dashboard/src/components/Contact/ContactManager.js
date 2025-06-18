import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactManager.css';

function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('https://portfolio-9unv.onrender.com/api/contacts');
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      // Sort by createdAt descending
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setMessage('Error fetching contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.delete(`hhttps://portfolio-9unv.onrender.com/api/contacts/${id}`);
      setContacts(contacts.filter(contact => contact._id !== id));
      setMessage('Contact moved to recycle bin!');
    } catch (err) {
      console.error('Error deleting contact:', err);
      setMessage('Error moving contact to recycle bin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-manager my-4">
      <h2>Contact Submissions</h2>
      {message && <div className="alert alert-info">{message}</div>}
      {isLoading && <p>Loading...</p>}
      <div className="contact-grid">
        {contacts.map(contact => {
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`;
          return (
            <div key={contact._id} className="contact-card">
              <div className="contact-details">
                <h5>{contact.name}</h5>
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Message:</strong> {contact.message}</p>
              </div>
              <div className="actions">
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm me-2"
                >
                  Email
                </a>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(contact._id)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContactManager;