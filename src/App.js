import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import EntryList from './components/EntryList';
import NewEntry from './components/NewEntry';
import NavigationMenu from './components/NavigationMenu';
import MapView from './components/MapView';
import Home from './components/Home';
import EditEntry from './components/EditEntry';
import AuthContainer from './components/Auth/AuthContainer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { fetchEntries, addEntry as addEntryToFirestore, deleteEntry as deleteEntryFromFirestore, updateEntry as updateEntryInFirestore } from './services/entryService';

// Banner en Footer componenten
const MEBanner = () => (
  <div className="me-banner">
    <img src="https://placehold.co/200x50/4CAF50/ffffff?text=Wandeldagboek" alt="Wandeldagboek Logo" />
    <h2>Wandeldagboek</h2>
  </div>
);

const MEFooter = () => (
  <footer className="me-footer">
    <div className="me-footer-content">
      <div>
        <p>Wandeldagboek App</p>
      </div>
      <div className="me-footer-links">
        <a href="#privacy">Privacy</a>
        <a href="#voorwaarden">Voorwaarden</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </footer>
);

function App() {
  // States voor applicatie - standaard 'home' in plaats van 'map'
  const [view, setView] = useState('home'); // 'home', 'list', 'new', 'map', 'edit'
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Laadstatus voor initiële authenticatie
  const [entriesLoading, setEntriesLoading] = useState(false); // Speciale status voor het laden van entries
  const [entriesError, setEntriesError] = useState(null); // Foutmeldingen bij ophalen entries
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Offline status
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true'); // Donkere modus
  const [selectedEntryId, setSelectedEntryId] = useState(null); // ID van geselecteerde entry voor bewerken
  const [toastMessage, setToastMessage] = useState(null); // Feedback bericht
  
  // Toast bericht tonen
  const showToast = (message, type = 'info', duration = 3000) => {
    setToastMessage({ text: message, type, id: Date.now() });
    
    // Automatisch verdwijnen na duration ms
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };
  
  // Toggle donkere modus
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };
  
  // Geselecteerde notitie ophalen voor bewerken
  const getSelectedEntry = () => {
    return entries.find(entry => entry.id === selectedEntryId) || null;
  };

  // Luister naar authenticatiestatus
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Authenticatie status veranderd:', currentUser ? `Ingelogd als ${currentUser.email}` : 'Uitgelogd');
      setUser(currentUser);
      setLoading(false);
    });

    // Unsubscribe functie teruggeven zodat de listener wordt opgeruimd bij unmount
    return () => unsubscribe();
  }, []);
  
  // Online/offline status bijhouden
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Je bent weer online!', 'success');
      loadEntriesFromFirestore(); // Refresh data wanneer weer online
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Je bent nu offline. Sommige functies zijn beperkt.', 'error');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Functie om entries op te halen uit Firestore
  const loadEntriesFromFirestore = useCallback(async () => {
    if (!user) {
      console.log('Geen gebruiker ingelogd, entries worden niet opgehaald');
      setEntries([]);
      return;
    }
    
    console.log('Entries ophalen voor gebruiker:', user.uid);
    setEntriesLoading(true);
    setEntriesError(null);
    
    try {
      const userEntries = await fetchEntries(user.uid);
      console.log(`${userEntries.length} entries opgehaald:`, userEntries);
      setEntries(userEntries);
    } catch (error) {
      console.error('Fout bij ophalen entries:', error);
      setEntriesError(`Fout bij ophalen notities: ${error.message || 'Onbekende fout'}`);
      showToast(`Fout bij ophalen notities: ${error.message || 'Onbekende fout'}`, 'error');
    } finally {
      setEntriesLoading(false);
    }
  }, [user, showToast]);

  // Haal entries op uit Firestore wanneer de gebruiker inlogt
  useEffect(() => {
    loadEntriesFromFirestore();
  }, [loadEntriesFromFirestore]);

  // Ververs entries handmatig
  const refreshEntries = () => {
    loadEntriesFromFirestore();
  };

  // Functie om een nieuwe entry toe te voegen
  const addEntry = async (entryData, imageFile, audioBlob) => {
    console.log('App.js: addEntry functie aangeroepen', { 
      data: entryData,
      imageFile: imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'Geen',
      audioBlob: audioBlob ? `Audio blob (${audioBlob.size} bytes)` : 'Geen'
    });
    
    try {
      // Controleer offline status
      if (isOffline) {
        showToast('Je bent offline. Notities opslaan is niet mogelijk.', 'error');
        return null;
      }
      
      // Controleer of gebruiker is ingelogd
      if (!user || !user.uid) {
        const errorMsg = 'Gebruiker niet ingelogd. Log in om notities toe te voegen.';
        console.error(errorMsg);
        showToast(errorMsg, 'error');
        return null;
      }
      
      // Gebruik de userId van de ingelogde gebruiker
      const userId = user.uid;
      console.log('Gebruiker geïdentificeerd:', userId);
      
      console.log('App.js: Firebase addEntryToFirestore aanroepen...');
      
      // Toon feedback dat we bezig zijn
      showToast('Wandelnotitie wordt opgeslagen...', 'info');
      
      try {
        // Toevoegen aan Firestore via de service
        const savedEntry = await addEntryToFirestore(entryData, userId, imageFile, audioBlob);
        
        console.log('Notitie succesvol opgeslagen:', savedEntry);
        
        // Update lokale state met de nieuwe entry
        setEntries(prevEntries => [savedEntry, ...prevEntries]);
        
        // Terug naar kaart navigeren
        setView('map');
        
        // Bevestiging tonen aan gebruiker
        showToast("Wandelnotitie succesvol opgeslagen!", 'success');
        
        return savedEntry;
      } catch (firestoreError) {
        console.error('Fout bij het opslaan in Firestore:', firestoreError);
        
        // Specifieke foutafhandeling voor verschillende soorten fouten
        if (firestoreError.code === 'permission-denied') {
          showToast('Je hebt geen toestemming om gegevens op te slaan. Controleer of je correct bent ingelogd en of de Firestore beveiligingsregels correct zijn ingesteld.', 'error');
        } else if (firestoreError.code === 'unavailable') {
          showToast('Firebase Firestore is momenteel niet beschikbaar. Controleer je internetverbinding en probeer het later opnieuw.', 'error');
        } else {
          showToast(`Fout bij het opslaan: ${firestoreError.message || 'Onbekende fout'}`, 'error');
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      showToast(`Fout bij het opslaan van de notitie: ${error.message || 'Onbekende fout'}`, 'error');
      return null;
    }
  };

  // Functie om een entry te verwijderen
  const deleteEntry = async (entryId) => {
    if (isOffline) {
      showToast('Je bent offline. Notities verwijderen is niet mogelijk.', 'error');
      return;
    }
    
    if (user) {
      try {
        // Laat gebruiker bevestigen
        if (!window.confirm('Weet je zeker dat je deze wandelnotitie wilt verwijderen?')) {
          return;
        }
        
        showToast('Bezig met verwijderen...', 'info');
        
        // Vind de entry die verwijderd moet worden
        const entryToDelete = entries.find(entry => entry.id === entryId);
        
        if (entryToDelete) {
          // Verwijder entry uit Firestore
          await deleteEntryFromFirestore(entryId, entryToDelete);
          
          // Werk lokale state bij
          const updatedEntries = entries.filter(entry => entry.id !== entryId);
          setEntries(updatedEntries);
          
          showToast('Wandelnotitie is verwijderd.', 'success');
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        showToast('Er is een fout opgetreden bij het verwijderen van de notitie. Probeer het opnieuw.', 'error');
      }
    }
  };
  
  // Functie om een wandelnotitie te bewerken
  const updateEntry = async (updatedEntry) => {
    if (isOffline) {
      showToast('Je bent offline. Notities bewerken is niet mogelijk.', 'error');
      return;
    }
    
    if (!user) {
      showToast('Je moet ingelogd zijn om notities te bewerken.', 'error');
      return;
    }
    
    try {
      showToast('Bezig met bijwerken...', 'info');
      
      // Update in Firestore
      await updateEntryInFirestore(updatedEntry);
      
      // Update lokale state
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      
      // Terug naar notitie overzicht
      setView('list');
      showToast('Wandelnotitie is bijgewerkt.', 'success');
    } catch (error) {
      console.error('Error updating entry:', error);
      showToast(`Fout bij het bijwerken: ${error.message || 'Onbekende fout'}`, 'error');
    }
  };

  // Functie voor het afhandelen van succesvolle authenticatie
  const handleAuthSuccess = (user) => {
    setUser(user);
    setView('home');
    showToast(`Welkom ${user.displayName || user.email}!`, 'success');
  };

  // Functies voor navigatie met geschiedenis
  const navigateTo = (newView, entryId = null) => {
    // Als we naar edit gaan, sla dan het entry ID op
    if (newView === 'edit' && entryId) {
      setSelectedEntryId(entryId);
    }
    
    setView(newView);
  };

  // Laadscherm weergeven tijdens initialisatie
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Laden...</p>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {loading ? (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Laden...</p>
        </div>
      ) : !user ? (
        <AuthContainer onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          <MEBanner />
          <div className="container">
            <header className="app-header">
              <div className="user-info">
                <span>Welkom, {user.email}</span>
                <button className="logout-btn" onClick={() => auth.signOut()}>Uitloggen</button>
              </div>
              <button className="theme-toggle" onClick={toggleDarkMode}>
                {darkMode ? '☀️ Licht' : '🌙 Donker'}
              </button>
            </header>
            
            <NavigationMenu currentView={view} onNavigate={setView} />
            
            {isOffline && (
              <div className="offline-indicator">
                Je bent offline. Sommige functies zijn beperkt beschikbaar.
              </div>
            )}
            
            {toastMessage && (
              <div className={`toast-message ${toastMessage.type} show`}>
                {toastMessage.text}
                <button onClick={() => setToastMessage(null)}>×</button>
              </div>
            )}

            {/* Hoofdinhoud */}
            {view === 'home' && <Home setView={setView} />}
            {view === 'list' && (
              <EntryList
                entries={entries}
                onDelete={deleteEntry}
                onEdit={(id) => {
                  setSelectedEntryId(id);
                  setView('edit');
                }}
                loading={entriesLoading}
                error={entriesError}
                onRefresh={refreshEntries}
              />
            )}
            {view === 'new' && <NewEntry onAddEntry={addEntry} onCancel={() => setView('map')} />}
            {view === 'map' && <MapView entries={entries} />}
            {view === 'edit' && (
              <EditEntry
                entry={getSelectedEntry()}
                onSave={updateEntry}
                onCancel={() => setView('list')}
              />
            )}
          </div>
          <MEFooter />
        </>
      )}
    </div>
  );
}

export default App; 