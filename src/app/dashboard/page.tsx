'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Observation, Walk, GeoPoint } from '../../lib/types';
import WalkManager from '../../components/WalkManager';
import LocationMap from '../../components/LocationMap';
import SearchBar from '../../components/SearchBar';
import DataManagement from '../../components/DataManagement';
import { calculateTotalDistance, formatDistance } from '../../lib/routeTracking';

export default function Dashboard() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWalks: 0,
    totalObservations: 0,
    totalWalkingTime: '0u 0m',
    observationsPerWalk: '0',
    totalDistance: '0 km'
  });
  const [expandedWalkId, setExpandedWalkId] = useState<string | null>(null);
  const [showRouteMap, setShowRouteMap] = useState<string | null>(null);
  const [highlightedObservationId, setHighlightedObservationId] = useState<string | null>(null);
  const [showDataManagement, setShowDataManagement] = useState(false);
  
  const observationRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    // Haal wandelingen en observaties op
    const storedWalks = JSON.parse(localStorage.getItem('walks') || '[]');
    const storedObservations = JSON.parse(localStorage.getItem('observations') || '[]');
    
    setWalks(storedWalks);
    setObservations(storedObservations);
    
    // Bereken statistieken
    calculateStats(storedWalks, storedObservations);
    
    setLoading(false);
  }, []);

  // Scroll naar een observatie als deze is geselecteerd
  useEffect(() => {
    if (highlightedObservationId && observationRefs.current[highlightedObservationId]) {
      // Vind de wandeling die deze observatie bevat
      const observation = observations.find(obs => obs.id === highlightedObservationId);
      if (observation && observation.walkId) {
        setExpandedWalkId(observation.walkId);
      }
      
      // Wacht even tot de UI is bijgewerkt
      setTimeout(() => {
        const ref = observationRefs.current[highlightedObservationId];
        if (ref) {
          ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ref.classList.add('bg-yellow-50');
          
          // Verwijder de highlight na een paar seconden
          setTimeout(() => {
            if (ref) {
              ref.classList.remove('bg-yellow-50');
              setHighlightedObservationId(null);
            }
          }, 3000);
        }
      }, 100);
    }
  }, [highlightedObservationId, observations]);

  // Bereken statistieken
  const calculateStats = (walks: Walk[], observations: Observation[]) => {
    const totalWalks = walks.length;
    const totalObservations = observations.length;
    
    // Bereken totale wandeltijd
    let totalWalkingTime = 0;
    let totalDistance = 0;
    
    walks.forEach(walk => {
      if (walk.endTime) {
        const start = new Date(walk.startTime).getTime();
        const end = new Date(walk.endTime).getTime();
        totalWalkingTime += (end - start);
      }
      
      // Bereken totale afstand
      if (walk.route && walk.route.length > 0) {
        totalDistance += calculateTotalDistance(walk.route);
      }
    });
    
    // Converteer naar uren en minuten
    const totalHours = Math.floor(totalWalkingTime / (1000 * 60 * 60));
    const totalMinutes = Math.floor((totalWalkingTime % (1000 * 60 * 60)) / (1000 * 60));
    
    setStats({
      totalWalks,
      totalObservations,
      totalWalkingTime: `${totalHours}u ${totalMinutes}m`,
      observationsPerWalk: totalWalks > 0 ? (totalObservations / totalWalks).toFixed(1) : '0',
      totalDistance: formatDistance(totalDistance)
    });
  };

  // Groepeer observaties per wandeling
  const getWalkObservations = (walkId: string) => {
    return observations.filter(obs => obs.walkId === walkId);
  };

  // Krijg losse observaties (niet gekoppeld aan een wandeling)
  const getStandaloneObservations = () => {
    return observations.filter(obs => !obs.walkId);
  };

  // Formateer datum
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Formateer tijd
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Bereken duur van een wandeling
  const calculateDuration = (walk: Walk) => {
    if (!walk.endTime) return 'Nog bezig';
    
    const start = new Date(walk.startTime).getTime();
    const end = new Date(walk.endTime).getTime();
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}u ${minutes}m`;
    } else {
      return `${minutes} minuten`;
    }
  };

  // Haal coördinaten uit locatiestring
  const parseCoordinates = (locationString: string): { latitude: number, longitude: number } | null => {
    try {
      const [latStr, lngStr] = locationString.split(',').map(s => s.trim());
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return { latitude, longitude };
      }
    } catch (error) {
      console.error('Fout bij het parsen van coördinaten:', error);
    }
    
    return null;
  };

  // Toggle uitklappen van een wandeling
  const toggleExpandWalk = (walkId: string) => {
    if (expandedWalkId === walkId) {
      setExpandedWalkId(null);
    } else {
      setExpandedWalkId(walkId);
    }
  };

  // Toggle weergave van routekaart
  const toggleRouteMap = (walkId: string) => {
    if (showRouteMap === walkId) {
      setShowRouteMap(null);
    } else {
      setShowRouteMap(walkId);
    }
  };

  // Zoekresultaat geselecteerd
  const handleSearchResultClick = (observationId: string) => {
    setHighlightedObservationId(observationId);
  };

  return (
    <div className="space-y-6">
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Terug naar home
      </Link>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mijn Waarnemingen</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDataManagement(!showDataManagement)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            title="Gegevensbeheer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
          <Link
            href="/waarneming"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Nieuwe waarneming
          </Link>
        </div>
      </div>
      
      {/* Zoekbalk */}
      <div className="mb-4">
        <SearchBar 
          observations={observations} 
          onResultClick={handleSearchResultClick} 
        />
      </div>
      
      {/* Wandeling beheer component */}
      <WalkManager />
      
      {/* Gegevensbeheer */}
      {showDataManagement && (
        <DataManagement />
      )}
      
      {/* Statistieken */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Statistieken</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-700">{stats.totalWalks}</div>
            <div className="text-sm text-gray-600">Wandelingen</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.totalObservations}</div>
            <div className="text-sm text-gray-600">Waarnemingen</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-700">{stats.totalWalkingTime}</div>
            <div className="text-sm text-gray-600">Totale wandeltijd</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-amber-700">{stats.observationsPerWalk}</div>
            <div className="text-sm text-gray-600">Gem. waarnemingen per wandeling</div>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-teal-700">{stats.totalDistance}</div>
            <div className="text-sm text-gray-600">Totale afstand</div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div>Laden...</div>
      ) : observations.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <p className="text-gray-600">Je hebt nog geen waarnemingen vastgelegd.</p>
          <Link
            href="/waarneming"
            className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Eerste waarneming toevoegen
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Toon wandelingen */}
          {walks.map(walk => {
            const walkObservations = getWalkObservations(walk.id);
            const isExpanded = expandedWalkId === walk.id;
            
            if (walkObservations.length === 0) return null;
            
            // Bereken afstand van de wandeling
            const distance = walk.route ? formatDistance(calculateTotalDistance(walk.route)) : 'Onbekend';
            
            return (
              <div key={walk.id} className="bg-white shadow-lg rounded-lg p-6">
                <div 
                  className="flex justify-between items-center mb-4 cursor-pointer"
                  onClick={() => toggleExpandWalk(walk.id)}
                >
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold">
                      {walk.title || `Wandeling ${formatDate(walk.startTime)}`}
                    </h2>
                    <div className="ml-2 text-gray-500">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {walkObservations.length} waarnemingen
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Datum:</span> {formatDate(walk.startTime)}
                  </div>
                  <div>
                    <span className="font-medium">Tijd:</span> {formatTime(walk.startTime)}
                    {walk.endTime && ` - ${formatTime(walk.endTime)}`}
                  </div>
                  {walk.endTime && (
                    <div>
                      <span className="font-medium">Duur:</span> {calculateDuration(walk)}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Afstand:</span> {distance}
                  </div>
                </div>
                
                {walk.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-gray-700">
                    <h3 className="font-medium mb-1">Notities:</h3>
                    <p>{walk.notes}</p>
                  </div>
                )}
                
                {walk.route && walk.route.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRouteMap(walk.id);
                      }}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {showRouteMap === walk.id ? 'Verberg route' : 'Toon route'}
                    </button>
                    
                    {showRouteMap === walk.id && (
                      <div className="mt-2">
                        <LocationMap 
                          latitude={walk.route[0].latitude}
                          longitude={walk.route[0].longitude}
                          popupText="Start van de wandeling"
                          height="300px"
                          zoom={14}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {isExpanded && (
                  <div className="grid gap-4 mt-4">
                    {walkObservations.map(observation => (
                      <div 
                        key={observation.id} 
                        className="border-t pt-4 transition-colors duration-300"
                        ref={el => { observationRefs.current[observation.id] = el; }}
                      >
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-500">
                            {formatTime(observation.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Weer: {observation.weather}
                          </div>
                        </div>
                        
                        <p className="text-gray-800 mb-4 whitespace-pre-wrap">{observation.text}</p>
                        
                        {observation.audioUrl && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Audio:</h4>
                            <audio src={observation.audioUrl} controls className="w-full" />
                          </div>
                        )}
                        
                        {observation.photos && observation.photos.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {observation.photos.map((photo, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={photo}
                                  alt={`Waarneming foto ${index + 1}`}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Locatie:</h4>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="text-gray-600">{observation.location}</div>
                            
                            {parseCoordinates(observation.location) && (
                              <div className="flex-1">
                                <LocationMap 
                                  latitude={parseCoordinates(observation.location)!.latitude}
                                  longitude={parseCoordinates(observation.location)!.longitude}
                                  popupText="Locatie van waarneming"
                                  height="200px"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isExpanded && walkObservations.length > 0 && (
                  <button
                    onClick={() => toggleExpandWalk(walk.id)}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Toon alle {walkObservations.length} waarnemingen
                  </button>
                )}
              </div>
            );
          })}
          
          {/* Toon losse observaties */}
          {getStandaloneObservations().length > 0 && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Losse waarnemingen</h2>
              
              <div className="grid gap-4">
                {getStandaloneObservations().map(observation => (
                  <div 
                    key={observation.id} 
                    className="border-t pt-4 transition-colors duration-300"
                    ref={el => { observationRefs.current[observation.id] = el; }}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="text-sm text-gray-500">
                        {formatDate(observation.date)} {formatTime(observation.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Weer: {observation.weather}
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-4 whitespace-pre-wrap">{observation.text}</p>
                    
                    {observation.audioUrl && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Audio:</h4>
                        <audio src={observation.audioUrl} controls className="w-full" />
                      </div>
                    )}
                    
                    {observation.photos && observation.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {observation.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo}
                              alt={`Waarneming foto ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Locatie:</h4>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="text-gray-600">{observation.location}</div>
                        
                        {parseCoordinates(observation.location) && (
                          <div className="flex-1">
                            <LocationMap 
                              latitude={parseCoordinates(observation.location)!.latitude}
                              longitude={parseCoordinates(observation.location)!.longitude}
                              popupText="Locatie van waarneming"
                              height="200px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 