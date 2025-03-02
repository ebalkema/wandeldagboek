import React, { useState } from 'react';

const EntryList = ({ entries, onDelete, onViewMap, onEdit, loading }) => {
  // Toegevoegde staten voor filteren en sorteren
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' of 'oldest'
  const [showFilters, setShowFilters] = useState(false);
  
  // Verzamelen van alle unieke categorieën in de entries
  const uniqueCategories = [...new Set(
    entries
      .filter(entry => entry.category)
      .map(entry => entry.category)
  )];
  
  // Filter en sorteer entries
  const filteredEntries = entries
    .filter(entry => {
      // Filter op zoekopdracht (in aantekeningen, locatienaam)
      const searchMatch = !searchTerm || 
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.location && entry.location.name && 
         entry.location.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter op categorie
      const categoryMatch = !categoryFilter || entry.category === categoryFilter;
      
      return searchMatch && categoryMatch;
    })
    .sort((a, b) => {
      const dateA = a.timestamp || a.createdAt;
      const dateB = b.timestamp || b.createdAt;
      
      if (!dateA || !dateB) return 0;
      
      const timeA = dateA.toDate ? dateA.toDate().getTime() : new Date(dateA).getTime();
      const timeB = dateB.toDate ? dateB.toDate().getTime() : new Date(dateB).getTime();
      
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  
  // Als er geen entries zijn, toon een bericht
  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <p>Nog geen wandelnotities. Maak je eerste notitie!</p>
      </div>
    );
  }
  
  // Toon laadanimatie als entries worden opgehaald
  if (loading) {
    return (
      <div className="entry-list">
        <div className="loading-entries">
          <span className="loading-spinner"></span>
          <span>Wandelnotities laden...</span>
        </div>
      </div>
    );
  }

  // Formatteer datum voor weergave - verbeterde versie met betere foutafhandeling
  const formatDate = (timestamp) => {
    // Controleer of timestamp is gedefinieerd
    if (!timestamp) {
      return 'Datum onbekend';
    }
    
    try {
      // Firestore Timestamp (toDate methode beschikbaar)
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      // Controleer of het een geldige datum is
      if (isNaN(date.getTime())) {
        console.error('Ongeldige datum gevonden:', timestamp);
        return 'Ongeldige datum';
      }
      
      return date.toLocaleString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Fout bij formatteren datum:', error);
      return 'Fout bij datumweergave';
    }
  };

  // Helper om weergegevens veilig weer te geven
  const renderWeather = (weatherData) => {
    if (!weatherData) {
      return (
        <div className="weather-info weather-unavailable">
          <strong>Weer: </strong>
          <span>Weergegevens niet beschikbaar</span>
        </div>
      );
    }
    
    // Controleer of we geldige weergegevens hebben
    const hasValidData = weatherData.description && 
                        weatherData.description !== 'gegevens niet beschikbaar' &&
                        weatherData.description !== 'Weergegevens niet beschikbaar' && 
                        weatherData.temperature !== undefined;
    
    if (!hasValidData) {
      return (
        <div className="weather-info weather-unavailable">
          <strong>Weer: </strong>
          <span>Weergegevens niet beschikbaar</span>
        </div>
      );
    }
    
    return (
      <div className="weather-info">
        <div>
          <strong>Weer: </strong>
          {weatherData.description}, {weatherData.temperature}°C
        </div>
        {weatherData.humidity && weatherData.windSpeed && (
          <div className="weather-details">
            <span className="weather-detail">Luchtvochtigheid: {weatherData.humidity}%</span>
            <span className="weather-detail">Wind: {weatherData.windSpeed} m/s</span>
          </div>
        )}
      </div>
    );
  };

  // Functie om naar kaartweergave te gaan voor een specifieke entry
  const viewOnMap = (entry) => {
    if (onViewMap && entry.location) {
      onViewMap(entry.id);
    }
  };
  
  // Filters wissen
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setShowFilters(false);
  };

  return (
    <div className="entry-list">
      {/* Breadcrumbs voor navigatie */}
      <ul className="breadcrumbs">
        <li><button 
              className="breadcrumb-link" 
              onClick={(e) => { e.preventDefault(); /* navigeer naar home */ }}
            >Home</button></li>
        <li className="current">Wandelnotities</li>
      </ul>
      
      {/* Zoek- en filterbalk */}
      <div className="search-and-filters">
        <div className="search-input">
          <input
            type="text"
            placeholder="Zoek in je notities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} title="Zoekopdracht wissen">
              ✕
            </button>
          )}
        </div>
        
        <button 
          className="filters-toggle" 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Filters verbergen' : 'Filters tonen'} {showFilters ? '▲' : '▼'}
        </button>
        
        {(searchTerm || categoryFilter) && (
          <button className="clear-filters" onClick={clearFilters}>
            Alles wissen
          </button>
        )}
      </div>
      
      {/* Uitgebreide filters (zichtbaar wanneer showFilters = true) */}
      {showFilters && (
        <div className="filters-container">
          <div>
            <label htmlFor="categoryFilter">Categorie:</label>
            <select 
              id="categoryFilter" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Alle categorieën</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sortOrder">Sorteren:</label>
            <select 
              id="sortOrder" 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Nieuwste eerst</option>
              <option value="oldest">Oudste eerst</option>
            </select>
          </div>
        </div>
      )}
      
      <h2>Jouw Wandelnotities {filteredEntries.length !== entries.length && `(${filteredEntries.length} van ${entries.length})`}</h2>
      
      {filteredEntries.length === 0 ? (
        <p>Geen notities gevonden die aan je zoekcriteria voldoen.</p>
      ) : (
        filteredEntries.map((entry) => (
          <div key={entry.id} className="entry-item card">
            <div className="entry-header">
              <h3>{formatDate(entry.timestamp || entry.createdAt)}</h3>
              <div className="entry-actions">
                {entry.location && (
                  <button 
                    className="view-on-map-btn"
                    onClick={() => viewOnMap(entry)}
                    title="Bekijk op kaart"
                  >
                    🗺️ Op kaart
                  </button>
                )}
                <button 
                  className="secondary-btn"
                  onClick={() => onEdit(entry)}
                  title="Bewerk deze notitie"
                >
                  ✏️ Bewerken
                </button>
                <button 
                  className="danger-btn" 
                  onClick={() => onDelete(entry.id)}
                  title="Verwijder deze notitie"
                >
                  Verwijderen
                </button>
              </div>
            </div>
            
            {entry.category && (
              <div className="entry-category">
                <span className={`category-tag ${entry.category}`}>{entry.category}</span>
              </div>
            )}
            
            <div className="entry-meta">
              <p>
                <strong>Locatie: </strong>
                {entry.location ? (
                  <>
                    {entry.location.name ? (
                      <>
                        <span className="location-name">{entry.location.name}</span>
                        <br />
                        <span className="location-coords">({entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)})</span>
                      </>
                    ) : (
                      `${entry.location.latitude.toFixed(4)}, ${entry.location.longitude.toFixed(4)}`
                    )}
                  </>
                ) : 'Onbekend'}
              </p>
              
              {renderWeather(entry.weather)}
            </div>
            
            {entry.audioUrl && (
              <div className="entry-audio">
                <p>
                  <strong>Spraaknotitie:</strong>
                  <a 
                    href={entry.audioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="media-link"
                    title="Open audio in nieuw tabblad"
                  >
                    🔗 Audio openen
                  </a>
                </p>
                <audio controls src={entry.audioUrl} />
                
                {entry.transcript && (
                  <div className="entry-transcript">
                    <p><strong>Getranscribeerde audio:</strong></p>
                    <p className="transcript-text">{entry.transcript}</p>
                  </div>
                )}
              </div>
            )}
            
            {entry.imageUrl && (
              <div className="entry-image-container">
                <p>
                  <strong>Foto:</strong>
                  <a 
                    href={entry.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="media-link"
                    title="Open foto in nieuw tabblad"
                  >
                    🔗 Foto openen
                  </a>
                </p>
                <img 
                  src={entry.imageUrl} 
                  alt="Wandelfoto" 
                  className="entry-image"
                  onClick={() => window.open(entry.imageUrl, '_blank')}
                />
              </div>
            )}
            
            {entry.notes && (
              <div className="entry-notes">
                <p><strong>Aantekeningen:</strong></p>
                <p>{entry.notes}</p>
              </div>
            )}
            
            <p className="entry-timestamp">
              <small>Opgeslagen op: {formatDate(entry.createdAt)}</small>
              {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                <small> (Laatst bijgewerkt: {formatDate(entry.updatedAt)})</small>
              )}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default EntryList; 