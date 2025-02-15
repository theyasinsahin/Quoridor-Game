import { useState } from 'react';

import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');

  const navLinks = [
  ];

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <nav className="navbar">
      {<div className="nav-left">
        <img src="/images/quoridor-logo-removebg.png" alt="Quoridor Logo" className="logo" />
      </div>}
      
      <div className="nav-right">
        {navLinks.map((link, index) => (
          <button
            key={index}
            className={`nav-link ${activeSection === link.href ? 'active' : ''}`}
            onClick={() => scrollToSection(link.href)}
          >
            {link.text}
          </button>
        ))}
      </div>

        <Link to="/start" className="play-button">Hemen Oyna</Link>
    </nav>
  );
};

export default Navbar;