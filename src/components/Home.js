import React from 'react';

const Home = () => {
  return (
    <div className="home-container card">
      <h2>Welkom bij Wandeldagboek</h2>
      
      <section className="app-description">
        <h3>Over deze app</h3>
        <p>
          Wandeldagboek is een handige app om je wandelervaringen vast te leggen. 
          Met deze app kun je audio-opnames maken tijdens je wandelingen, foto's toevoegen 
          en notities maken. De app slaat automatisch je locatie en het actuele weer op.
        </p>
      </section>
      
      <section className="features">
        <h3>Belangrijkste functies</h3>
        <ul>
          <li><strong>Spraaknotities</strong> - Neem je gedachten op tijdens het wandelen</li>
          <li><strong>Automatische transcriptie</strong> - Je gesproken woorden worden automatisch omgezet in tekst</li>
          <li><strong>Locatie en weer</strong> - Automatisch opslaan van waar je was en het weer op dat moment</li>
          <li><strong>Foto's toevoegen</strong> - Maak of kies een foto om toe te voegen aan je notitie</li>
          <li><strong>Kaartweergave</strong> - Bekijk al je notities op een interactieve kaart</li>
          <li><strong>Offline toegang</strong> - Gebruik de app zelfs zonder internetverbinding als PWA</li>
        </ul>
      </section>
      
      <section className="how-to-use">
        <h3>Zo gebruik je de app</h3>
        <ol>
          <li>
            <strong>Nieuwe notitie maken</strong>
            <p>Klik op 'Nieuwe Notitie' in het menu en geef toegang tot je locatie en microfoon.</p>
          </li>
          <li>
            <strong>Audio opnemen</strong>
            <p>Klik op de 'Start Opname' knop en spreek je notitie in. Klik op 'Stop Opname' als je klaar bent.</p>
          </li>
          <li>
            <strong>Foto toevoegen</strong>
            <p>Als je wilt, kun je een foto toevoegen aan je notitie.</p>
          </li>
          <li>
            <strong>Notities bewerken</strong>
            <p>Je kunt extra aantekeningen toevoegen of de automatisch getranscribeerde tekst aanvullen.</p>
          </li>
          <li>
            <strong>Notitie opslaan</strong>
            <p>Klik op 'Opslaan' om je wandelnotitie te bewaren.</p>
          </li>
          <li>
            <strong>Notities bekijken</strong>
            <p>Bekijk al je notities in de 'Wandelnotities' lijst of op de kaart via 'Kaartweergave'.</p>
          </li>
        </ol>
      </section>
      
      <section className="pwa-instructions">
        <h3>Deze app toevoegen aan je beginscherm</h3>
        <p>
          Je kunt Wandeldagboek als app toevoegen aan het beginscherm van je telefoon:
        </p>
        <h4>Op iPhone (Safari):</h4>
        <ol>
          <li>Tik op het 'Delen' icoon onderaan het scherm</li>
          <li>Scroll omlaag en tik op 'Zet op beginscherm'</li>
          <li>Geef een naam op en tik op 'Voeg toe'</li>
        </ol>
        <h4>Op Android (Chrome):</h4>
        <ol>
          <li>Tik op de drie puntjes rechtsboven</li>
          <li>Selecteer 'Toevoegen aan startscherm'</li>
          <li>Bevestig door op 'Toevoegen' te tikken</li>
        </ol>
      </section>
      
      <div className="created-by">
        <p>
          Ontwikkeld door Erwin Balkema
        </p>
      </div>
    </div>
  );
};

export default Home; 