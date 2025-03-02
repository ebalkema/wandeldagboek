import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Fix voor het icoon probleem in Leaflet met React
let DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Deze component past de kaartweergave aan nadat de kaart is geladen
const MapBounds = ({ entries, userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    // Verzamel alle geldige locaties (inclusief gebruikerslocatie als die beschikbaar is)
    const validLocations = entries
      .filter(entry => entry.location)
      .map(entry => [entry.location.latitude, entry.location.longitude]);
    
    if (userLocation) {
      validLocations.push(userLocation);
    }
    
    if (validLocations.length > 0) {
      // Als er locaties zijn, maak dan een bounds object
      const bounds = L.latLngBounds(validLocations);
      
      // Zoom naar de bounds met wat padding
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15 // Beperk de maximale zoom om te voorkomen dat we te veel inzoomen
      });
    } else if (userLocation) {
      // Als er geen wandelnotities zijn maar wel een gebruikerslocatie
      map.setView(userLocation, 13);
    }
    // Anders blijft de standaard view (Amsterdam) behouden
  }, [map, entries, userLocation]);

  return null;
};

// Component om vogelinformatie te tonen op de kaart
const BirdInfo = ({ location }) => {
  const map = useMap();
  const [birdData, setBirdData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBirdData = async () => {
      if (!location || !Array.isArray(location) || location.length !== 2) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Coordinaten in het juiste formaat (lat,lng)
        const lat = location[0];
        const lng = location[1];
        
        // eBird API aanroepen met de gegeven API key
        const response = await fetch(
          `https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=10&maxResults=10`,
          {
            method: 'GET',
            headers: {
              'X-eBirdApiToken': 'ddqtvos8h97l'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`eBird API fout: ${response.status}`);
        }
        
        const data = await response.json();
        setBirdData(data);
      } catch (err) {
        console.error('Fout bij ophalen vogelgegevens:', err);
        setError('Kon vogelgegevens niet ophalen');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBirdData();
  }, [location]);
  
  return null;
};

// Helper functie om Nederlandse vogelnaam te krijgen
const getNederlandseVogelnaam = (engelseNaam, wetenschappelijkeNaam) => {
  // Eenvoudige mapping van veelvoorkomende vogels (kan uitgebreid worden met meer soorten)
  const vogelMapping = {
    'Eurasian Blackbird': 'Merel',
    'European Robin': 'Roodborst',
    'Great Tit': 'Koolmees',
    'Blue Tit': 'Pimpelmees',
    'Carrion Crow': 'Zwarte Kraai',
    'Common Wood-Pigeon': 'Houtduif',
    'Mallard': 'Wilde Eend',
    'White Stork': 'Ooievaar',
    'House Sparrow': 'Huismus',
    'Barn Swallow': 'Boerenzwaluw',
    'Common Buzzard': 'Buizerd',
    'Eurasian Magpie': 'Ekster',
    'Eurasian Coot': 'Meerkoet',
    'Common Chaffinch': 'Vink',
    'European Goldfinch': 'Putter',
    'Common Starling': 'Spreeuw',
    'Western Jackdaw': 'Kauw',
    'European Greenfinch': 'Groenling',
    'Common Swift': 'Gierzwaluw',
    'Eurasian Collared-Dove': 'Turkse Tortel',
    'Tufted Duck': 'Kuifeend',
    'Common Blackbird': 'Merel',
    'Eurasian Oystercatcher': 'Scholekster',
    'Black-headed Gull': 'Kokmeeuw',
    'Herring Gull': 'Zilvermeeuw',
    'Lesser Black-backed Gull': 'Kleine Mantelmeeuw',
    'Common Chiffchaff': 'Tjiftjaf',
    'European Goldfinch': 'Putter',
    'Great Spotted Woodpecker': 'Grote Bonte Specht',
    'Eurasian Wren': 'Winterkoning',
    'European Robin': 'Roodborst',
    'Greylag Goose': 'Grauwe Gans',
    'Canada Goose': 'Canadese Gans',
    'Common Moorhen': 'Waterhoen',
    'Graylag Goose': 'Grauwe Gans',
    'Great Blue Heron': 'Blauwe Reiger',
    'Grey Heron': 'Blauwe Reiger',
  };

  // Probeer eerst de Engelse naam
  if (vogelMapping[engelseNaam]) {
    return vogelMapping[engelseNaam];
  }

  // Als we geen directe match hebben, probeer te zoeken naar delen van de naam
  for (const [engelseKey, nederlandseNaam] of Object.entries(vogelMapping)) {
    if (engelseNaam.includes(engelseKey) || engelseKey.includes(engelseNaam)) {
      return nederlandseNaam;
    }
  }

  // Als er geen match is, geef aan dat de Nederlandse naam onbekend is
  return 'Nederlandse naam onbekend';
};

// Helper functie om een afbeelding URL voor een vogel te krijgen
const getVogelAfbeeldingUrl = (engelseNaam, wetenschappelijkeNaam) => {
  // Vervang spaties door plussen voor de zoekquery
  const zoekterm = wetenschappelijkeNaam.replace(/ /g, '+');
  
  // Retourneer twee mogelijke afbeeldingsbronnen
  return {
    // Wikipedia Commons link via de wetenschappelijke naam
    wikimedia: `https://commons.wikimedia.org/wiki/Special:Search?search=${zoekterm}&fulltext=1`,
    // Google Images zoeklink
    google: `https://www.google.com/search?q=${zoekterm}+bird&tbm=isch`
  };
};

const MapView = ({ entries }) => {
  const [center, setCenter] = useState([52.3676, 4.9041]); // Amsterdam als standaard centrum
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [birdData, setBirdData] = useState(null);
  const [loadingBirds, setLoadingBirds] = useState(false);
  const [birdError, setBirdError] = useState(null);
  const mapRef = useRef(null);

  // Effect om gebruikerslocatie op te halen bij laden
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          // We zetten center alleen als er geen entries zijn
          if (entries.filter(entry => entry.location).length === 0) {
            setCenter([latitude, longitude]);
          }
        },
        (error) => {
          console.error("Fout bij ophalen locatie:", error);
        }
      );
    }
  }, [entries]);

  // Functie om vogel-gegevens op te halen voor een specifieke locatie
  const fetchBirdData = async (location) => {
    if (!location) return;
    
    setLoadingBirds(true);
    setBirdError(null);
    setSelectedLocation(location);
    
    try {
      // Coordinaten in het juiste formaat (lat,lng)
      const lat = location[0];
      const lng = location[1];
      
      // eBird API aanroepen met de gegeven API key
      const response = await fetch(
        `https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=10&maxResults=10`,
        {
          method: 'GET',
          headers: {
            'X-eBirdApiToken': 'ddqtvos8h97l'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`eBird API fout: ${response.status}`);
      }
      
      const data = await response.json();
      setBirdData(data);
    } catch (err) {
      console.error('Fout bij ophalen vogelgegevens:', err);
      setBirdError('Kon vogelgegevens niet ophalen');
    } finally {
      setLoadingBirds(false);
    }
  };

  // Helper functie om datum te formatteren
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

  // Formatteer eBird observatie datum
  const formatObsDate = (obsDate) => {
    if (!obsDate) return 'Onbekende datum';
    
    const [year, month, day] = obsDate.split('-');
    return `${day}-${month}-${year}`;
  };

  // Icon voor gebruikerslocatie
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: iconShadow,
    shadowSize: [41, 41]
  });

  // Icon voor wandelnotities
  const entryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: iconShadow,
    shadowSize: [41, 41]
  });

  // Icon voor vogelobservaties
  const birdIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: iconShadow,
    shadowSize: [41, 41]
  });

  // Tel het aantal entries met locaties
  const entriesWithLocation = entries.filter(entry => entry.location).length;

  return (
    <div className="map-container">
      <h2>Kaartoverzicht Wandelnotities</h2>
      
      <div className="map-wrapper">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '500px', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Component die de kaartgrenzen instelt */}
          <MapBounds entries={entries} userLocation={userLocation} />
          
          {/* Marker voor huidige locatie gebruiker */}
          {userLocation && (
            <Marker 
              position={userLocation}
              icon={userIcon}
              eventHandlers={{
                click: () => {
                  fetchBirdData(userLocation);
                }
              }}
            >
              <Popup>
                <div className="map-popup">
                  <h3>Jouw locatie</h3>
                  <button 
                    onClick={() => fetchBirdData(userLocation)}
                    className="bird-info-btn"
                  >
                    Toon vogels in dit gebied
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Markers voor alle entries */}
          {entries.map(entry => {
            if (!entry.location) return null;
            
            const position = [entry.location.latitude, entry.location.longitude];
            
            return (
              <Marker 
                key={entry.id}
                position={position}
                icon={entryIcon}
                eventHandlers={{
                  click: () => {
                    fetchBirdData(position);
                  }
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <h3>{formatDate(entry.timestamp)}</h3>
                    <p>
                      <strong>Locatie:</strong>{' '}
                      {entry.locationName || 'Onbekende locatie'}
                    </p>
                    
                    {entry.weather && entry.weather.description !== 'gegevens niet beschikbaar' && (
                      <p>
                        <strong>Weer:</strong>{' '}
                        {entry.weather.description}, {entry.weather.temperature}°C
                      </p>
                    )}
                    
                    {entry.notes && (
                      <p>
                        <strong>Notities:</strong>{' '}
                        {entry.notes.length > 50 ? `${entry.notes.substring(0, 50)}...` : entry.notes}
                      </p>
                    )}
                    
                    {entry.photo && (
                      <img 
                        src={entry.photo} 
                        alt="Foto bij notitie" 
                        className="popup-thumbnail" 
                      />
                    )}
                    
                    <button 
                      onClick={() => fetchBirdData(position)}
                      className="bird-info-btn"
                    >
                      Toon vogels in dit gebied
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Toon vogelgegevens indien beschikbaar */}
          {birdData && birdData.length > 0 && selectedLocation && (
            <div className="bird-info-panel">
              <h3>Vogels in dit gebied</h3>
              <div className="bird-list">
                {birdData.map((bird, index) => {
                  const nederlandseNaam = getNederlandseVogelnaam(bird.comName, bird.sciName);
                  const afbeeldingUrls = getVogelAfbeeldingUrl(bird.comName, bird.sciName);
                  
                  return (
                    <Marker
                      key={`${bird.speciesCode}-${index}`}
                      position={[bird.lat, bird.lng]}
                      icon={birdIcon}
                    >
                      <Popup>
                        <div className="bird-popup">
                          <h3>{bird.comName}</h3>
                          <p><strong>Nederlandse naam:</strong> {nederlandseNaam}</p>
                          <p><strong>Wetenschappelijke naam:</strong> {bird.sciName}</p>
                          <p><strong>Waargenomen op:</strong> {formatObsDate(bird.obsDt)}</p>
                          <p><strong>Aantal:</strong> {bird.howMany || 'Onbekend'}</p>
                          <div className="bird-links">
                            <p>
                              <a 
                                href={`https://ebird.org/species/${bird.speciesCode}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Meer info op eBird
                              </a>
                            </p>
                            <p>
                              <a 
                                href={afbeeldingUrls.wikimedia} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Afbeeldingen op Wikimedia
                              </a>
                            </p>
                            <p>
                              <a 
                                href={afbeeldingUrls.google} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Afbeeldingen op Google
                              </a>
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </div>
            </div>
          )}
        </MapContainer>
      </div>
      
      {/* Panel voor vogelgegevens */}
      <div className="bird-panel">
        {loadingBirds && (
          <div className="loading-birds">Vogel informatie laden...</div>
        )}
        
        {birdError && (
          <div className="bird-error">
            <p>{birdError}</p>
          </div>
        )}
        
        {birdData && (
          <div className="bird-data-panel">
            <h3>Vogels in het gebied</h3>
            {birdData.length === 0 ? (
              <p>Geen vogelobservaties gevonden in dit gebied.</p>
            ) : (
              <ul className="bird-list">
                {birdData.map((bird, index) => {
                  const nederlandseNaam = getNederlandseVogelnaam(bird.comName, bird.sciName);
                  const afbeeldingUrls = getVogelAfbeeldingUrl(bird.comName, bird.sciName);
                  
                  return (
                    <li key={`${bird.speciesCode}-${index}`} className="bird-item">
                      <div className="bird-name">
                        <strong>{bird.comName}</strong> 
                        <span className="bird-dutch-name">{nederlandseNaam !== 'Nederlandse naam onbekend' ? ` (${nederlandseNaam})` : ''}</span>
                        <span className="bird-scientific">({bird.sciName})</span>
                      </div>
                      <div className="bird-details">
                        <span>Waargenomen: {formatObsDate(bird.obsDt)}</span>
                        {bird.howMany && <span> • Aantal: {bird.howMany}</span>}
                      </div>
                      <div className="bird-image-links">
                        <a 
                          href={afbeeldingUrls.wikimedia} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="image-link"
                        >
                          Wikimedia
                        </a>
                        <span className="link-separator">•</span>
                        <a 
                          href={afbeeldingUrls.google} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="image-link"
                        >
                          Google Afbeeldingen
                        </a>
                        <span className="link-separator">•</span>
                        <a 
                          href={`https://ebird.org/species/${bird.speciesCode}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="image-link"
                        >
                          eBird
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
      
      <div className="map-info">
        {entriesWithLocation === 0 ? (
          <p className="no-entries-message">Nog geen wandelnotities om weer te geven. Maak een nieuwe wandelnotitie om deze op de kaart te zien.</p>
        ) : (
          <p className="entries-count">{entriesWithLocation} {entriesWithLocation === 1 ? 'wandelnotitie' : 'wandelnotities'} op de kaart</p>
        )}
      </div>
      
      <div className="map-legend">
        <p><span className="user-marker"></span> Jouw huidige locatie</p>
        <p><span className="entry-marker"></span> Wandelnotities</p>
        <p><span className="bird-marker"></span> Vogelobservaties</p>
      </div>
    </div>
  );
};

export default MapView; 