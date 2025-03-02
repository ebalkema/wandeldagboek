import React from 'react';

const EntryList = ({ entries, onDelete }) => {
  // Als er geen entries zijn, toon een bericht
  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <p>Nog geen wandelnotities. Maak je eerste notitie!</p>
      </div>
    );
  }

  // Formatteer datum voor weergave
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper om weergegevens veilig weer te geven
  const renderWeather = (weatherData) => {
    if (!weatherData) return null;
    
    // Controleer of we geldige weergegevens hebben
    const hasValidData = weatherData.description && 
                        weatherData.description !== 'gegevens niet beschikbaar' && 
                        weatherData.temperature !== undefined;
    
    if (!hasValidData) {
      return (
        <p className="weather-info">
          <strong>Weer: </strong>
          <span className="weather-unavailable">Weergegevens niet beschikbaar</span>
        </p>
      );
    }
    
    return (
      <p className="weather-info">
        <strong>Weer: </strong>
        {weatherData.description}, {weatherData.temperature}°C
      </p>
    );
  };

  return (
    <div className="entry-list">
      <h2>Jouw Wandelnotities</h2>
      {entries.map((entry) => (
        <div key={entry.id} className="entry-item card">
          <div className="entry-header">
            <h3>{formatDate(entry.timestamp)}</h3>
            <button 
              className="danger" 
              onClick={() => onDelete(entry.id)}
            >
              Verwijderen
            </button>
          </div>
          
          <div className="entry-meta">
            <p>
              <strong>Locatie: </strong>
              {entry.location ? (
                <>
                  {entry.locationName ? (
                    <>
                      <span className="location-name">{entry.locationName}</span>
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
          
          {entry.audio && (
            <div className="entry-audio">
              <p><strong>Spraaknotitie:</strong></p>
              <audio controls src={entry.audio} />
              
              {entry.transcript && (
                <div className="entry-transcript">
                  <p><strong>Getranscribeerde audio:</strong></p>
                  <p className="transcript-text">{entry.transcript}</p>
                </div>
              )}
            </div>
          )}
          
          {entry.photo && (
            <div>
              <p><strong>Foto:</strong></p>
              <img 
                src={entry.photo} 
                alt="Wandelfoto" 
                className="entry-image"
              />
            </div>
          )}
          
          {entry.notes && (
            <div>
              <p><strong>Aantekeningen:</strong></p>
              <p>{entry.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EntryList; 