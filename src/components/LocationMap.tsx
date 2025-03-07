'use client';

import React, { useEffect, useState } from 'react';

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface LocationMapProps {
  latitude: number;
  longitude: number;
  popupText?: string;
  height?: string;
  width?: string;
  zoom?: number;
}

export default function LocationMap({ 
  latitude, 
  longitude, 
  popupText, 
  height = '300px', 
  width = '100%',
  zoom = 13
}: LocationMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Dynamisch laden van Leaflet CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkElement.crossOrigin = '';
    document.head.appendChild(linkElement);

    // Dynamisch laden van Leaflet JS
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptElement.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    scriptElement.crossOrigin = '';
    scriptElement.onload = () => {
      setMapLoaded(true);
    };
    scriptElement.onerror = () => {
      setMapError(true);
    };
    document.head.appendChild(scriptElement);

    return () => {
      // Cleanup
      document.head.removeChild(linkElement);
      document.head.removeChild(scriptElement);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && typeof window !== 'undefined' && window.L) {
      // Initialiseer de kaart
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        const L = window.L;
        const map = L.map('map').setView([latitude, longitude], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker([latitude, longitude]).addTo(map);
        if (popupText) {
          marker.bindPopup(popupText).openPopup();
        }

        // Cleanup functie
        return () => {
          map.remove();
        };
      }
    }
  }, [mapLoaded, latitude, longitude, popupText, zoom]);

  if (mapError) {
    return (
      <div 
        style={{ height, width, backgroundColor: '#f0f0f0' }}
        className="flex items-center justify-center rounded-lg"
      >
        <p className="text-gray-500">Kaart kon niet worden geladen</p>
      </div>
    );
  }

  return (
    <div 
      id="map" 
      style={{ height, width }}
      className="rounded-lg shadow-md"
    >
      {!mapLoaded && (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
} 