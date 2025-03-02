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

const MapView = ({ entries }) => {
  const [center, setCenter] = useState([52.3676, 4.9041]); // Amsterdam als standaard centrum
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  // Effect om gebruikerslocatie op te halen bij laden
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
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

  // Helper functie om datum te formatteren
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Onbekende datum';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      if (isNaN(date.getTime())) {
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
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div className="map-popup">
                  <h3>Jouw locatie</h3>
                  <p>Dit is je huidige locatie</p>
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
              >
                <Popup>
                  <div className="map-popup">
                    <h3>{entry.title || formatDate(entry.timestamp || entry.createdAt)}</h3>
                    <p>
                      <strong>Locatie:</strong>{' '}
                      {entry.location.name || 'Onbekende locatie'}
                    </p>
                    
                    {entry.notes && (
                      <p>
                        <strong>Notities:</strong>{' '}
                        {entry.notes.length > 50 ? `${entry.notes.substring(0, 50)}...` : entry.notes}
                      </p>
                    )}
                    
                    {entry.imageUrl && (
                      <img 
                        src={entry.imageUrl} 
                        alt="Foto bij notitie" 
                        className="popup-thumbnail" 
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
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
      </div>
    </div>
  );
};

export default MapView; 