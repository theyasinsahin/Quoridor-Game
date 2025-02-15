import './HowToPlay.css';

// components/HowToPlay.jsx
const HowToPlay = () => {
    const steps = [
      {
        icon: '❶',
        title: 'Oyunu Kur',
        content: 'Oyuncular sırayla ya duvar yerleştirir ya da piyonunu hareket ettirir. Amacın rakibinden önce karşı tarafa ulaşmak!'
      },
      {
        icon: '❷',
        title: 'Duvarları Stratejik Yerleştir',
        content: 'Her oyuncunun sınırlı sayıda duvar hakkı vardır. Rakibin yolunu bloke ederken kendi yolunu açık tut!'
      },
      {
        icon: '❸',
        title: 'Zekanı Kullan',
        content: 'Her hamle önemli! Uzun vadeli stratejiler geliştir ve rakibinin hamlelerini önceden tahmin etmeye çalış!'
      }
    ];
  
    return (
      <section className="how-to-play" id="how-to-play">
        <div className="section-header">
          <h2>Nasıl Oynanır?</h2>
          <p>Quoridor'u ustalıkla oynamak için temel kurallar</p>
        </div>
  
        <div className="steps-container">
          {steps.map((step, index) => (
            <div className="step-card" key={index}>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.content}</p>
            </div>
          ))}
        </div>
  
        
      </section>
    );
  };
  
  export default HowToPlay;