import React from 'react';

const Home = ({ setView }) => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h2>Wandeldagboek</h2>
        <p className="hero-subtitle">Leg je wandelervaringen vast</p>
        <div className="hero-image">
          <img src="https://placehold.co/800x400/4CAF50/ffffff?text=Wandelen+in+de+natuur" alt="Wandelen in de natuur" />
        </div>
      </section>
      
      <section className="app-description card">
        <h3>Over deze app</h3>
        <p>
          Wandeldagboek is een eenvoudige app om je wandelervaringen vast te leggen. 
          Met deze app kun je audio-opnames maken tijdens je wandelingen, foto's toevoegen 
          en notities maken. De app slaat automatisch je locatie en het actuele weer op.
        </p>
      </section>
      
      <section className="features">
        <h3>Functies</h3>
        <div className="features-grid">
          <div className="feature-item card">
            <span className="feature-icon">🎤</span>
            <h4>Spraaknotities</h4>
            <p>Neem je gedachten op tijdens het wandelen</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">📝</span>
            <h4>Notities</h4>
            <p>Maak tekstnotities bij je wandelingen</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">📍</span>
            <h4>Locatie</h4>
            <p>Automatisch opslaan van waar je was</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">☁️</span>
            <h4>Weer</h4>
            <p>Automatisch opslaan van het weer</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">📸</span>
            <h4>Foto's</h4>
            <p>Voeg foto's toe aan je notities</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">🗺️</span>
            <h4>Kaart</h4>
            <p>Bekijk je notities op een kaart</p>
          </div>
        </div>
      </section>
      
      <section className="how-to-use">
        <h3>Zo gebruik je de app</h3>
        <div className="steps-container">
          <div className="step card">
            <span className="step-number">1</span>
            <h4>Nieuwe notitie</h4>
            <p>Klik op 'Nieuwe Notitie' in het menu</p>
          </div>
          <div className="step card">
            <span className="step-number">2</span>
            <h4>Audio opnemen</h4>
            <p>Klik op 'Start Opname' en spreek je notitie in</p>
          </div>
          <div className="step card">
            <span className="step-number">3</span>
            <h4>Foto toevoegen</h4>
            <p>Voeg een foto toe aan je notitie</p>
          </div>
          <div className="step card">
            <span className="step-number">4</span>
            <h4>Opslaan</h4>
            <p>Klik op 'Opslaan' om je notitie te bewaren</p>
          </div>
        </div>
      </section>
      
      <section className="get-started card">
        <h3>Begin direct</h3>
        <p>Maak je eerste wandelnotitie en begin met het vastleggen van je wandelervaringen.</p>
        <button className="primary-btn" onClick={() => setView('new')}>
          Nieuwe wandelnotitie maken
        </button>
      </section>
      
      <section className="pwa-instructions card">
        <h3>App toevoegen aan beginscherm</h3>
        <div className="pwa-grid">
          <div className="pwa-item">
            <h4>iPhone (Safari)</h4>
            <ol>
              <li>Tik op 'Delen' onderaan</li>
              <li>Kies 'Zet op beginscherm'</li>
              <li>Tik op 'Voeg toe'</li>
            </ol>
          </div>
          <div className="pwa-item">
            <h4>Android (Chrome)</h4>
            <ol>
              <li>Tik op menu (drie puntjes)</li>
              <li>Kies 'Toevoegen aan startscherm'</li>
              <li>Tik op 'Toevoegen'</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 