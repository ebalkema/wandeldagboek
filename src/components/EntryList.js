import React, { useState, useEffect } from 'react';

const EntryList = ({ entries, onDelete, onViewMap, onEdit, loading }) => {
  // Toegevoegde staten voor filteren en sorteren
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' of 'oldest'
  const [showFilters, setShowFilters] = useState(false);
  const [animatedEntries, setAnimatedEntries] = useState([]);
  
  // Effect voor het geleidelijk laden van entries voor een mooie animatie
  useEffect(() => {
    setAnimatedEntries([]);
    const timer = setTimeout(() => {
      setAnimatedEntries(filteredEntries.map(entry => entry.id));
    }, 100);
    return () => clearTimeout(timer);
  }, [entries, searchTerm, categoryFilter, sortOrder]);
  
  // Verzamelen van alle unieke categorieën in de entries
  const uniqueCategories = [...new Set(
    entries
      .filter(entry => entry.category)
      .map(entry => entry.category)
  )];
  
  // Filter en sorteer entries
  const filteredEntries = entries
    .filter(entry => {
      // Filter op zoekopdracht (in aantekeningen, locatienaam, titel)
      const searchMatch = !searchTerm || 
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.location && entry.location.name && 
         entry.location.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
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
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>Nog geen wandelnotities</h3>
          <p>Begin met het vastleggen van je wandelervaringen door op 'Nieuwe notitie' te klikken.</p>
        </div>
      </div>
    );
  }
  
  // Toon laadanimatie als entries worden opgehaald
  if (loading) {
    return (
      <div className="entry-list">
        <div className="loading-entries">
          <div className="loading-spinner"></div>
          <p>Wandelnotities laden...</p>
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
    
    // Bepaal het juiste weer-icoon
    const getWeatherIcon = (description) => {
      const desc = description.toLowerCase();
      if (desc.includes('zon') || desc.includes('helder') || desc.includes('clear')) return '☀️';
      if (desc.includes('wolk') || desc.includes('bewolkt') || desc.includes('cloud')) return '☁️';
      if (desc.includes('regen') || desc.includes('rain')) return '🌧️';
      if (desc.includes('onweer') || desc.includes('thunder')) return '⛈️';
      if (desc.includes('sneeuw') || desc.includes('snow')) return '❄️';
      if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
      return '🌤️'; // Standaard icoon
    };
    
    return (
      <div className="weather-info">
        <div className="weather-main">
          <span className="weather-icon">{getWeatherIcon(weatherData.description)}</span>
          <span className="weather-description">
            <strong>{weatherData.description}</strong>
            <span className="weather-temp">{weatherData.temperature}°C</span>
          </span>
        </div>
        {weatherData.humidity && weatherData.windSpeed && (
          <div className="weather-details">
            <span className="weather-detail">💧 {weatherData.humidity}%</span>
            <span className="weather-detail">💨 {weatherData.windSpeed} m/s</span>
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

  // Bepaal categorie-icoon
  const getCategoryIcon = (category) => {
    if (!category) return null;
    
    const categoryMap = {
      'Bos': '🌳',
      'Strand': '🏖️',
      'Berg': '⛰️',
      'Park': '🏞️',
      'Stad': '🏙️',
      'Platteland': '🌾',
      'Rivier': '🏞️',
      'Meer': '💦',
      'Heide': '🌿',
      'Duinen': '🏝️'
    };
    
    return categoryMap[category] || '🚶';
  };

  return (
    <div className="entry-list">
      {/* Zoek- en filterbalk */}
      <div className="search-and-filters">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Zoek in je notities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')} 
              title="Zoekopdracht wissen"
            >
              ✕
            </button>
          )}
        </div>
        
        <button 
          className={`filters-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="filter-icon">🔍</span>
          {showFilters ? 'Filters verbergen' : 'Filters tonen'}
        </button>
      </div>
      
      {/* Uitgebreide filters (zichtbaar wanneer showFilters = true) */}
      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="categoryFilter">Categorie:</label>
            <select 
              id="categoryFilter" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Alle categorieën</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
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
          
          {(searchTerm || categoryFilter) && (
            <button className="clear-filters" onClick={clearFilters}>
              Filters wissen
            </button>
          )}
        </div>
      )}
      
      <h2 className="entries-title">
        <span className="title-icon">📋</span>
        Jouw Wandelnotities 
        {filteredEntries.length !== entries.length && (
          <span className="filter-count">({filteredEntries.length} van {entries.length})</span>
        )}
      </h2>
      
      {filteredEntries.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <p>Geen notities gevonden die aan je zoekcriteria voldoen.</p>
          <button className="clear-filters" onClick={clearFilters}>
            Filters wissen
          </button>
        </div>
      ) : (
        <div className="entries-grid">
          {filteredEntries.map((entry) => (
            <div 
              key={entry.id} 
              className={`entry-item card ${animatedEntries.includes(entry.id) ? 'animated' : ''}`}
            >
              <div className="entry-header">
                <div className="entry-title-container">
                  <h3>{entry.title || formatDate(entry.timestamp || entry.createdAt)}</h3>
                  {entry.title && <span className="entry-date">{formatDate(entry.timestamp || entry.createdAt)}</span>}
                  {entry.category && (
                    <span className="entry-category">
                      {getCategoryIcon(entry.category)} {entry.category}
                    </span>
                  )}
                </div>
                <div className="entry-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit(entry)}
                    title="Bewerk deze notitie"
                  >
                    <span className="action-icon">✏️</span>
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => onDelete(entry.id)}
                    title="Verwijder deze notitie"
                  >
                    <span className="action-icon">🗑️</span>
                  </button>
                </div>
              </div>
              
              <div className="entry-content">
                {entry.location && entry.location.name && (
                  <div className="location-info">
                    <div className="location-name">
                      <span className="location-icon">📍</span> {entry.location.name}
                    </div>
                    {entry.location.latitude && entry.location.longitude && (
                      <div className="location-coords">
                        {entry.location.latitude.toFixed(5)}, {entry.location.longitude.toFixed(5)}
                        <button 
                          className="view-on-map-btn"
                          onClick={() => viewOnMap(entry)}
                          title="Bekijk op kaart"
                        >
                          <span className="map-icon">🗺️</span> Op kaart
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {entry.weather && renderWeather(entry.weather)}
                
                {entry.notes && (
                  <div className="entry-notes">
                    <p>{entry.notes}</p>
                  </div>
                )}
                
                {entry.imageUrl && (
                  <div className="entry-image-container">
                    <img 
                      src={entry.imageUrl} 
                      alt="Foto bij wandelnotitie" 
                      className="entry-image"
                      onClick={() => window.open(entry.imageUrl, '_blank')}
                    />
                  </div>
                )}
                
                {entry.audioUrl && (
                  <div className="entry-audio-container">
                    <audio 
                      controls 
                      src={entry.audioUrl} 
                      className="entry-audio"
                    >
                      Je browser ondersteunt geen audio-element.
                    </audio>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntryList; 