import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NavLink, useLocation } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faProjectDiagram, faCogs, faBlog, faCertificate, faEnvelope, faCode, faTrash, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Home() {
  const [aboutTitle, setAboutTitle] = useState('');
  const [projectCount, setProjectCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);
  const [recycleBinCount, setRecycleBinCount] = useState(0);
  const [dailyContacts, setDailyContacts] = useState(0);
  const [weeklyContacts, setWeeklyContacts] = useState(0);
  const [monthlyContacts, setMonthlyContacts] = useState(0);
  const [yearlyContacts, setYearlyContacts] = useState(0);
  const [errors, setErrors] = useState([]);
  const [dashboardTitleText, setDashboardTitleText] = useState('');
  const sliderRef = useRef(null);
  const location = useLocation();

  const allCards = ['About', 'Projects', 'Services', 'Skills', 'Blog', 'Certificates', 'Contacts', 'Recycle Bin'];

  const fetchData = async () => {
    const newErrors = [];
    
    try {
      const aboutRes = await axios.get('http://localhost:5000/api/about');
      console.log('About API response:', aboutRes.data);
      const aboutData = Array.isArray(aboutRes.data) ? aboutRes.data : [];
      setAboutTitle(aboutData.length > 0 ? aboutData[0].title || '' : '');
    } catch (err) {
      const errorMsg = `Failed to fetch About: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
      setAboutTitle('');
    }

    try {
      const projectRes = await axios.get('http://localhost:5000/api/projects');
      console.log('Projects API response:', projectRes.data);
      setProjectCount(Array.isArray(projectRes.data) ? projectRes.data.length : 0);
    } catch (err) {
      const errorMsg = `Failed to fetch Projects: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
    }

    try {
      const serviceRes = await axios.get('http://localhost:5000/api/services');
      console.log('Services API response:', serviceRes.data);
      setServiceCount(Array.isArray(serviceRes.data) ? serviceRes.data.length : 0);
    } catch (err) {
      const errorMsg = `Failed to fetch Services: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
    }

    try {
      const blogRes = await axios.get('http://localhost:5000/api/blog');
      console.log('Blog API response:', blogRes.data);
      setBlogCount(Array.isArray(blogRes.data) ? blogRes.data.length : 0);
    } catch (err) {
      const errorMsg = `Failed to fetch Blog: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
    }

    try {
      const certificateRes = await axios.get('http://localhost:5000/api/certificates');
      console.log('Certificates API response:', certificateRes.data);
      setCertificateCount(Array.isArray(certificateRes.data) ? certificateRes.data.length : 0);
    } catch (err) {
      const errorMsg = `Failed to fetch Certificates: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
    }

    try {
      const contactRes = await axios.get('http://localhost:5000/api/contacts');
      console.log('Contacts API response:', contactRes.data);
      const contacts = Array.isArray(contactRes.data) ? contactRes.data : [];
      setContactCount(contacts.length);

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const daily = contacts.filter(contact => {
        const createdAt = new Date(contact.createdAt);
        return createdAt >= startOfDay;
      }).length;

      const weekly = contacts.filter(contact => {
        const createdAt = new Date(contact.createdAt);
        return createdAt >= startOfWeek;
      }).length;

      const monthly = contacts.filter(contact => {
        const createdAt = new Date(contact.createdAt);
        return createdAt >= startOfMonth;
      }).length;

      const yearly = contacts.filter(contact => {
        const createdAt = new Date(contact.createdAt);
        return createdAt >= startOfYear;
      }).length;

      setDailyContacts(daily);
      setWeeklyContacts(weekly);
      setMonthlyContacts(monthly);
      setYearlyContacts(yearly);
    } catch (err) {
      const errorMsg = `Failed to fetch Contacts: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
      setDailyContacts(0);
      setWeeklyContacts(0);
      setMonthlyContacts(0);
      setYearlyContacts(0);
    }

    try {
      const skillRes = await axios.get('http://localhost:5000/api/skills');
      console.log('Skills API response:', skillRes.data);
      setSkillCount(Array.isArray(skillRes.data) ? skillRes.data.length : 0);
    } catch (err) {
      const errorMsg = `Failed to fetch Skills: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
    }

    try {
      const recycleBinRes = await axios.get('http://localhost:5000/api/recycle-bin');
      console.log('Recycle Bin API response:', recycleBinRes.data);
      const recycleBinData = Array.isArray(recycleBinRes.data) ? recycleBinRes.data : [];
      setRecycleBinCount(recycleBinData.length);
    } catch (err) {
      const errorMsg = `Failed to fetch Recycle Bin: ${err.response?.status || ''} ${err.message}`;
      console.error(errorMsg, err.response?.data || err);
      newErrors.push(errorMsg);
      setRecycleBinCount(0);
    }

    setErrors(newErrors);
  };

  useEffect(() => {
    fetchData();
    const pollingInterval = setInterval(fetchData, 10000);
    return () => clearInterval(pollingInterval);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      console.log('Navigated to Home, refetching data');
      fetchData();
    }
  }, [location]);

  useEffect(() => {
    const welcomeText = 'WELCOME MR. TANDEL';
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      setDashboardTitleText(welcomeText.substring(0, charIndex));
      if (!isDeleting) {
        charIndex++;
        if (charIndex > welcomeText.length) {
          isDeleting = true;
          setTimeout(type, 1000);
        } else {
          setTimeout(type, 150);
        }
      } else {
        charIndex--;
        if (charIndex < 0) {
          isDeleting = false;
          setTimeout(type, 500);
        } else {
          setTimeout(type, 100);
        }
      }
    };

    type();
    return () => clearTimeout();
  }, []);

  const chartData = {
    labels: ['Projects', 'Services', 'Skills', 'Blog Posts', 'Certificates', 'Contacts', 'Recycle Bin'],
    datasets: [
      {
        label: 'Count',
        data: [projectCount, serviceCount, skillCount, blogCount, certificateCount, contactCount, recycleBinCount],
        backgroundColor: 'rgba(0, 234, 255, 0.6)',
        borderColor: 'var(--accent-color)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    },
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: true, text: 'Content Overview', color: '#ffffff', font: { size: 18 } },
      tooltip: { titleColor: '#ffffff', bodyColor: '#ffffff' },
    },
  };

  const contactChartData = {
    labels: ['Today', 'This Week', 'This Month', 'This Year'],
    datasets: [
      {
        label: 'Contact Statistics',
        data: [dailyContacts, weeklyContacts, monthlyContacts, yearlyContacts],
        backgroundColor: [
          'rgba(0, 255, 255, 0.8)',
          'rgba(0, 221, 221, 0.8)',
          'rgba(0, 187, 187, 0.8)',
          'rgba(0, 153, 153, 0.8)',
        ],
        borderColor: ['#00ffff', '#00dddd', '#00bbbb', '#009999'],
        borderWidth: 2,
        hoverOffset: 20,
      },
    ],
  };

  const contactChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: { size: 14 },
          padding: 20,
          boxWidth: 20,
        },
      },
      title: {
        display: true,
        text: 'Contact Statistics',
        color: '#ffffff',
        font: { size: 18 },
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        enabled: true,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context) => {
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      const { ctx, chartArea, data } = chart;
      const total = data.datasets[0].data.reduce((acc, val) => acc + val, 0);
      ctx.save();
      ctx.font = 'bold 20px Montserrat';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      ctx.fillText(`${total}`, centerX, centerY - 10);
      ctx.font = '12px Montserrat';
      ctx.fillText('Total Contacts', centerX, centerY + 10);
      ctx.restore();
    },
  };

  const renderCard = (type) => {
    switch (type) {
      case 'About':
        return (
          <NavLink to="/about" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faInfoCircle} className="icon" />
              <h3>About</h3>
              <p>{aboutTitle || 'Learn more about us.'}</p>
            </div>
          </NavLink>
        );
      case 'Projects':
        return (
          <NavLink to="/projects" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faProjectDiagram} className="icon" />
              <h3>Projects</h3>
              <p>{projectCount} projects</p>
            </div>
          </NavLink>
        );
      case 'Services':
        return (
          <NavLink to="/services" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faCogs} className="icon" />
              <h3>Services</h3>
              <p>{serviceCount} services</p>
            </div>
          </NavLink>
        );
      case 'Skills':
        return (
          <NavLink to="/skills" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faCode} className="icon" />
              <h3>Skills</h3>
              <p>{skillCount} skills</p>
            </div>
          </NavLink>
        );
      case 'Blog':
        return (
          <NavLink to="/blog" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faBlog} className="icon" />
              <h3>Blog</h3>
              <p>{blogCount} posts</p>
            </div>
          </NavLink>
        );
      case 'Certificates':
        return (
          <NavLink to="/certificates" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faCertificate} className="icon" />
              <h3>Certificates</h3>
              <p>{certificateCount} certificates</p>
            </div>
          </NavLink>
        );
      case 'Contacts':
        return (
          <NavLink to="/contact" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faEnvelope} className="icon" />
              <h3>Contacts</h3>
              <p>{contactCount} submissions</p>
            </div>
          </NavLink>
        );
      case 'Recycle Bin':
        return (
          <NavLink to="/recycle-bin" className="card-link">
            <div className="summary-card">
              <FontAwesomeIcon icon={faTrash} className="icon" />
              <h3>Recycle Bin</h3>
              <p>{recycleBinCount} items</p>
            </div>
          </NavLink>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    console.log('Logged out');
    // Add actual logout logic here, e.g., clear auth token, redirect to login
  };

  return (
    <div className="home">
      <button className="logout-btn" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
      </button>
      <div className="title-container">
        <div className="title-card">
          <h1 className="dashboard-title">{dashboardTitleText}</h1>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="alert alert-danger">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
      <div className="summary-slider" ref={sliderRef}>
        <div className="slider-track">
          {[...allCards, ...allCards].map((card, index) => (
            <div key={index} className="summary-card-wrapper">
              {renderCard(card)}
            </div>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <div className="chart-wrapper">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="contact-stats-container">
        <div className="contact-stats-wrapper">
          <Doughnut
            data={contactChartData}
            options={contactChartOptions}
            plugins={[centerTextPlugin]}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;