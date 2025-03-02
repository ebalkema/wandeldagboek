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

// Component om het kaartbereik in te stellen op basis van entries en gebruikerslocatie
const MapBounds = ({ entries, userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    // Als er wandelnotities zijn, zoom in op alle entries
    if (entries && entries.length > 0) {
      const bounds = new L.LatLngBounds();
      
      // Voeg alle entries toe aan de bounds
      entries.forEach(entry => {
        if (entry.location && entry.location.latitude && entry.location.longitude) {
          bounds.extend([entry.location.latitude, entry.location.longitude]);
        }
      });
      
      // Voeg de gebruikerslocatie toe aan de bounds als deze beschikbaar is
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      
      // Als we geldige bounds hebben, pas de kaartweergave aan
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } 
    // Als er alleen een gebruikerslocatie is, centreer daarop
    else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    }
    // Anders blijft de standaard view (Amsterdam) behouden
  }, [map, entries, userLocation]);

  return null;
};

// Helper functie om Nederlandse vogelnaam te bepalen
const getNederlandseVogelnaam = (engelseNaam, wetenschappelijkeNaam) => {
  // Mapping van Engelse naar Nederlandse namen
  const vogelNamen = {
    'Common Blackbird': 'Merel',
    'European Robin': 'Roodborst',
    'Great Tit': 'Koolmees',
    'Eurasian Blue Tit': 'Pimpelmees',
    'House Sparrow': 'Huismus',
    'Common Chaffinch': 'Vink',
    'European Greenfinch': 'Groenling',
    'European Goldfinch': 'Putter',
    'Common Starling': 'Spreeuw',
    'Common Wood Pigeon': 'Houtduif',
    'Eurasian Magpie': 'Ekster',
    'Eurasian Jay': 'Gaai',
    'Carrion Crow': 'Zwarte Kraai',
    'Mallard': 'Wilde Eend',
    'Mute Swan': 'Knobbelzwaan',
    'Great Cormorant': 'Aalscholver',
    'Grey Heron': 'Blauwe Reiger',
    'Black-headed Gull': 'Kokmeeuw',
    'Herring Gull': 'Zilvermeeuw',
    'Common Kingfisher': 'IJsvogel',
    'White Wagtail': 'Witte Kwikstaart',
    'Song Thrush': 'Zanglijster',
    'Dunnock': 'Heggenmus',
    'Western Jackdaw': 'Kauw',
    'Common Chiffchaff': 'Tjiftjaf',
    'Willow Warbler': 'Fitis',
    'Goldcrest': 'Goudhaantje',
    'Long-tailed Tit': 'Staartmees',
    'Marsh Tit': 'Glanskop',
    'Coal Tit': 'Zwarte Mees',
    'Common Moorhen': 'Waterhoen',
    'Common Coot': 'Meerkoet',
    'Northern Lapwing': 'Kievit',
    'Common Sandpiper': 'Oeverloper',
    'Common Snipe': 'Watersnip',
    'Common Pheasant': 'Fazant',
    'Greylag Goose': 'Grauwe Gans',
    'Canada Goose': 'Canadese Gans',
    'Barnacle Goose': 'Brandgans',
    'Eurasian Oystercatcher': 'Scholekster',
    'Pied Avocet': 'Kluut',
    'Common Redstart': 'Gekraagde Roodstaart',
    'Black Redstart': 'Zwarte Roodstaart',
    'Grey Wagtail': 'Grote Gele Kwikstaart',
    'Common Swift': 'Gierzwaluw'
  };

  return vogelNamen[engelseNaam] || wetenschappelijkeNaam || engelseNaam;
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