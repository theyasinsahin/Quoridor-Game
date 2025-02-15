import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      };

    return (
      <section className="hero-section" id="home">
        <div className="hero-content">
          <h1 className="hero-title">QUORIDOR</h1>
          <p className="hero-subtitle">Zekanın ve Stratejinin Büyük Düellosu</p>
          <div className="hero-buttons">
            <Link to="/start" className="hero-play-button" >Hemen Oyna</Link>
            <button className="hero-howtoplay-button" onClick={() => scrollToSection("how-to-play")}>Nasıl Oynanır?</button>
          </div>
        </div>
        
        
      </section>
    );
  };
  
  export default HeroSection;