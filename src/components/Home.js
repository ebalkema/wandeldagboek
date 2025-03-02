import React from 'react';

const Home = ({ setView }) => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h2>Wandeldagboek</h2>
        <p className="hero-subtitle">Leg je wandelervaringen vast in de natuur</p>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
            alt="Wandelen in de natuur" 
          />
        </div>
      </section>
      
      <section className="app-description card">
        <h3>Jouw persoonlijke wandelervaring</h3>
        <p>
          Wandeldagboek is een app die speciaal ontworpen is om je wandelervaringen vast te leggen. 
          Tijdens je wandelingen kun je audio-opnames maken, foto's toevoegen en notities maken. 
          De app slaat automatisch je locatie op, zodat je later precies weet 
          waar je was tijdens je wandeling.
        </p>
        <p className="app-tagline">
          Elke wandeling vertelt een verhaal. Laat Wandeldagboek jouw verhalen bewaren.
        </p>
      </section>
      
      <section className="features">
        <h3>Wat kun je allemaal doen?</h3>
        <div className="features-grid">
          <div className="feature-item card">
            <span className="feature-icon">🎤</span>
            <h4>Spraaknotities</h4>
            <p>Neem je gedachten op tijdens het wandelen zonder te stoppen</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">📝</span>
            <h4>Notities</h4>
            <p>Maak tekstnotities met persoonlijke indrukken van je wandeling</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">📍</span>
            <h4>Locatie</h4>
            <p>Automatisch opslaan van je exacte route en locatie</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">📸</span>
            <h4>Foto's</h4>
            <p>Leg de mooiste momenten vast met een foto bij je notitie</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">🎧</span>
            <h4>Audio</h4>
            <p>Neem geluiden op of spreek je gedachten in tijdens je wandeling</p>
          </div>
          <div className="feature-item card">
            <span className="feature-icon">🗺️</span>
            <h4>Kaart</h4>
            <p>Bekijk al je wandelingen op een interactieve kaart</p>
          </div>
        </div>
      </section>
      
      <section className="inspiration">
        <h3>Inspiratie voor je volgende wandeling</h3>
        <div className="inspiration-content">
          <div className="inspiration-image-container">
            <img 
              src="https://images.unsplash.com/photo-1552083375-1447ce886485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
              alt="Inspirerende wandelroute" 
              className="inspiration-image"
            />
          </div>
          <div className="inspiration-text">
            <p>
              Ontdek nieuwe wandelroutes in jouw omgeving of plan je volgende avontuur in de natuur.
              Met Wandeldagboek kun je niet alleen je ervaringen vastleggen, maar ook inspiratie opdoen
              voor nieuwe wandelingen door je eerdere avonturen terug te kijken.
            </p>
            <p>
              <strong>Tip:</strong> Probeer elke week een nieuwe route te ontdekken en leg je ervaringen vast.
              Zo bouw je een prachtige collectie van natuurherinneringen op.
            </p>
          </div>
        </div>
      </section>
      
      <section className="how-to-use">
        <h3>Zo gebruik je de app</h3>
        <div className="steps-container">
          <div className="step card">
            <span className="step-number">1</span>
            <h4>Nieuwe notitie</h4>
            <p>Klik op 'Nieuwe Notitie' in het menu wanneer je begint met wandelen</p>
          </div>
          <div className="step card">
            <span className="step-number">2</span>
            <h4>Audio opnemen</h4>
            <p>Klik op 'Start Opname' en vertel over wat je ziet en ervaart</p>
          </div>
          <div className="step card">
            <span className="step-number">3</span>
            <h4>Foto toevoegen</h4>
            <p>Leg de mooiste momenten vast met een foto bij je notitie</p>
          </div>
          <div className="step card">
            <span className="step-number">4</span>
            <h4>Opslaan</h4>
            <p>Klik op 'Opslaan' om je herinnering voor altijd te bewaren</p>
          </div>
        </div>
      </section>
      
      <section className="get-started card">
        <h3>Begin direct met je wandelavontuur</h3>
        <p>Maak je eerste wandelnotitie en begin met het vastleggen van je unieke wandelervaringen.</p>
        <button className="primary-btn cta-button" onClick={() => setView('new')}>
          Start je wandelnotitie
        </button>
      </section>
      
      <section className="pwa-instructions card">
        <h3>Altijd bij de hand: voeg toe aan je beginscherm</h3>
        <div className="pwa-grid">
          <div className="pwa-item">
            <h4>iPhone (Safari)</h4>
            <ol>
              <li>Tik op 'Delen' onderaan je scherm</li>
              <li>Scroll en kies 'Zet op beginscherm'</li>
              <li>Tik op 'Voeg toe' rechtsboven</li>
            </ol>
          </div>
          <div className="pwa-item">
            <h4>Android (Chrome)</h4>
            <ol>
              <li>Tik op menu (drie puntjes) rechtsboven</li>
              <li>Kies 'Toevoegen aan startscherm'</li>
              <li>Tik op 'Toevoegen' om te bevestigen</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 