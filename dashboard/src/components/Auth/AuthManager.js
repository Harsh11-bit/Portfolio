import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthManager.css';

function AuthManager({ onLogin, loggedIn }) {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [containerClass, setContainerClass] = useState('bounceRight');

  useEffect(() => {
    if (loggedIn) {
      navigate('/', { replace: true });
    } else {
      setContainerClass('bounceRight');
    }
  }, [loggedIn, navigate]);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
      setMessage(response.data.message);
      onLogin();
      navigate('/', { replace: true });
    } catch (error) {
      setMessage(error.response?.data.error || 'Error occurred');
    }
  };

  return (
    <section className="user">
      <div className="user_options-container">
        <div className="user_options-text">
          <div className="user_options-welcome" style={{ width: '100%', padding: '75px 45px', color: '#fff', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.66rem', marginBottom: '15px' }}>WELCOME MR HARSH TANDEL</h2>
            <p style={{ fontSize: '0.83rem' }}>Please log in to continue</p>
          </div>
        </div>
        <div className={`user_options-forms ${containerClass}`} id="user_options-forms">
          <div className="user_forms-login">
            <h2 className="forms_title">Login</h2>
            <form className="forms_form" onSubmit={handleSubmit}>
              <fieldset className="forms_fieldset">
                <div className="forms_field">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="forms_field-input"
                    required
                    autoFocus
                    value={loginData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="forms_field">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="forms_field-input"
                    required
                    value={loginData.password}
                    onChange={handleChange}
                  />
                </div>
              </fieldset>
              <div className="forms_buttons">
                <input type="submit" value="Log In" className="forms_buttons-action" />
              </div>
            </form>
          </div>
        </div>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
    </section>
  );
}

export default AuthManager;