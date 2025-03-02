import React, { useState, useEffect } from 'react';
import './App.css';
import EntryList from './components/EntryList';
import NewEntry from './components/NewEntry';
import NavigationMenu from './components/NavigationMenu';
import MapView from './components/MapView';

function App() {
  // States voor applicatie - standaard 'map' in plaats van 'list'
  const [view, setView] = useState('map'); // 'list', 'new', 'map'
  const [entries, setEntries] = useState([]);

  // Ophalen van entries uit localStorage bij het laden van de app
  useEffect(() => {
    const storedEntries = localStorage.getItem('wandeldagboekEntries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  // Opslaan van entries in localStorage wanneer entries wijzigen
  useEffect(() => {
    localStorage.setItem('wandeldagboekEntries', JSON.stringify(entries));
  }, [entries]);

  // Functie om een nieuwe entry toe te voegen
  const addEntry = (newEntry) => {
    setEntries([...entries, newEntry]);
    setView('map'); // Na toevoegen direct naar kaart
  };

  // Functie om een entry te verwijderen
  const deleteEntry = (entryId) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
  };

  // Functie om inhoud te renderen op basis van huidige weergave
  const renderContent = () => {
    switch(view) {
      case 'list':
        return (
          <>
            <EntryList entries={entries} onDelete={deleteEntry} />
          </>
        );
      case 'new':
        return (
          <NewEntry 
            onAddEntry={addEntry} 
            onCancel={() => setView('map')} // Terug naar kaart bij annuleren
          />
        );
      case 'map':
        return <MapView entries={entries} />;
      default:
        return <MapView entries={entries} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Wandeldagboek</h1>
      </header>
      
      <div className="container">
        <a 
          href="http://www.mennoenerwin.nl" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="podcast-link"
        >
          Meer inspiratie? Luister de Menno en Erwin podcast!
        </a>

        <NavigationMenu currentView={view} onNavigate={setView} />
        
        {renderContent()}
      </div>
    </div>
  );
}

export default App; 