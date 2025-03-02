import React from 'react';

const Home = ({ setView }) => {
  return (
    <div className="home-container card">
      <section className="hero-section">
        <h2>Welkom bij Wandeldagboek</h2>
        <div className="hero-image">
          <img src="https://www.mennoenerwin.nl/wandelen-hero.jpg" alt="Wandelen in de natuur" />
        </div>
      </section>
      
      <section className="app-description">
        <h3>Over deze app</h3>
        <p>
          Wandeldagboek is een handige app om je wandelervaringen vast te leggen, 
          geïnspireerd door de prachtige wandelavonturen op <a href="https://www.mennoenerwin.nl/wandelen" target="_blank" rel="noopener noreferrer">mennoenerwin.nl</a>. 
          Met deze app kun je audio-opnames maken tijdens je wandelingen, foto's toevoegen 
          en notities maken. De app slaat automatisch je locatie en het actuele weer op.
        </p>
      </section>
      
      <section className="features">
        <h3>Belangrijkste functies</h3>
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🎤</span>
            <h4>Spraaknotities</h4>
            <p>Neem je gedachten op tijdens het wandelen</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📝</span>
            <h4>Automatische transcriptie</h4>
            <p>Je gesproken woorden worden automatisch omgezet in tekst</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📍</span>
            <h4>Locatie en weer</h4>
            <p>Automatisch opslaan van waar je was en het weer op dat moment</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📸</span>
            <h4>Foto's toevoegen</h4>
            <p>Maak of kies een foto om toe te voegen aan je notitie</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🗺️</span>
            <h4>Kaartweergave</h4>
            <p>Bekijk al je notities op een interactieve kaart</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <h4>Offline toegang</h4>
            <p>Gebruik de app zelfs zonder internetverbinding als PWA</p>
          </div>
        </div>
      </section>
      
      <section className="inspiration">
        <h3>Geïnspireerd door Menno & Erwin</h3>
        <div className="inspiration-content">
          <img src="https://www.mennoenerwin.nl/about-image.jpg" alt="Menno & Erwin" className="inspiration-image" />
          <div className="inspiration-text">
            <p>
              Deze app is geïnspireerd door de prachtige wandelavonturen van Menno & Erwin. 
              Bekijk hun <a href="https://www.mennoenerwin.nl/wandelen" target="_blank" rel="noopener noreferrer">wandelroutes</a> en 
              <a href="https://www.mennoenerwin.nl/fotos" target="_blank" rel="noopener noreferrer">foto's</a> voor inspiratie voor je 
              eigen wandelingen!
            </p>
            <button className="primary-btn" onClick={() => setView('new')}>
              Start je wandelavontuur
            </button>
          </div>
        </div>
      </section>
      
      <section className="how-to-use">
        <h3>Zo gebruik je de app</h3>
        <div className="steps-container">
          <div className="step">
            <span className="step-number">1</span>
            <h4>Nieuwe notitie maken</h4>
            <p>Klik op 'Nieuwe Notitie' in het menu en geef toegang tot je locatie en microfoon.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h4>Audio opnemen</h4>
            <p>Klik op de 'Start Opname' knop en spreek je notitie in. Klik op 'Stop Opname' als je klaar bent.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h4>Foto toevoegen</h4>
            <p>Als je wilt, kun je een foto toevoegen aan je notitie.</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <h4>Notities bewerken</h4>
            <p>Je kunt extra aantekeningen toevoegen of de automatisch getranscribeerde tekst aanvullen.</p>
          </div>
        </div>
      </section>
      
      <section className="pwa-instructions">
        <h3>Deze app toevoegen aan je beginscherm</h3>
        <div className="pwa-grid">
          <div className="pwa-card">
            <h4>Op iPhone (Safari):</h4>
            <ol>
              <li>Tik op het 'Delen' icoon onderaan het scherm</li>
              <li>Scroll omlaag en tik op 'Zet op beginscherm'</li>
              <li>Geef een naam op en tik op 'Voeg toe'</li>
            </ol>
          </div>
          <div className="pwa-card">
            <h4>Op Android (Chrome):</h4>
            <ol>
              <li>Tik op de drie puntjes rechtsboven</li>
              <li>Selecteer 'Toevoegen aan startscherm'</li>
              <li>Bevestig door op 'Toevoegen' te tikken</li>
            </ol>
          </div>
        </div>
      </section>
      
      <div className="created-by">
        <p>
          Ontwikkeld door Erwin Balkema, geïnspireerd door 
          <a href="https://www.mennoenerwin.nl" target="_blank" rel="noopener noreferrer">mennoenerwin.nl</a>
        </p>
      </div>
    </div>
  );
};

export default Home; 