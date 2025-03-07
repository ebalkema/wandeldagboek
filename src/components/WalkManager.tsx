'use client';

import React, { useState, useEffect } from 'react';
import { Walk } from '../lib/types';
import { startRouteTracking, stopRouteTracking } from '../lib/routeTracking';

export default function WalkManager() {
  const [activeWalkId, setActiveWalkId] = useState<string | null>(null);
  const [activeWalk, setActiveWalk] = useState<Walk | null>(null);
  const [walkTitle, setWalkTitle] = useState('');
  const [walkNotes, setWalkNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    // Controleer of er een actieve wandeling is bij het laden van de component
    const storedActiveWalkId = localStorage.getItem('activeWalkId');
    
    if (storedActiveWalkId) {
      setActiveWalkId(storedActiveWalkId);
      
      // Haal de actieve wandeling op
      const walks = JSON.parse(localStorage.getItem('walks') || '[]');
      const currentWalk = walks.find((walk: Walk) => walk.id === storedActiveWalkId);
      
      if (currentWalk) {
        setActiveWalk(currentWalk);
        
        // Start routetracking als er een actieve wandeling is
        if (trackingEnabled) {
          const id = startRouteTracking(storedActiveWalkId);
          setWatchId(id);
        }
      }
    }
    
    // Cleanup functie
    return () => {
      if (watchId !== null) {
        stopRouteTracking(watchId);
      }
    };
  }, [trackingEnabled]);

  const startWalk = () => {
    const walks = JSON.parse(localStorage.getItem('walks') || '[]');
    
    const newWalk: Walk = {
      id: Date.now().toString(),
      title: walkTitle || `Wandeling ${new Date().toLocaleDateString('nl-NL')}`,
      notes: walkNotes || undefined,
      startTime: new Date().toISOString(),
      observations: [],
    };
    
    walks.push(newWalk);
    localStorage.setItem('walks', JSON.stringify(walks));
    localStorage.setItem('activeWalkId', newWalk.id);
    
    setActiveWalkId(newWalk.id);
    setActiveWalk(newWalk);
    setWalkTitle('');
    setWalkNotes('');
    
    // Start routetracking
    if (trackingEnabled) {
      const id = startRouteTracking(newWalk.id);
      setWatchId(id);
    }
  };

  const endWalk = () => {
    if (activeWalkId) {
      const walks = JSON.parse(localStorage.getItem('walks') || '[]');
      const walkIndex = walks.findIndex((walk: Walk) => walk.id === activeWalkId);
      
      if (walkIndex !== -1) {
        walks[walkIndex].endTime = new Date().toISOString();
        localStorage.setItem('walks', JSON.stringify(walks));
      }
      
      localStorage.removeItem('activeWalkId');
      setActiveWalkId(null);
      setActiveWalk(null);
      
      // Stop routetracking
      if (watchId !== null) {
        stopRouteTracking(watchId);
        setWatchId(null);
      }
    }
  };

  const updateWalk = () => {
    if (activeWalkId && activeWalk) {
      const walks = JSON.parse(localStorage.getItem('walks') || '[]');
      const walkIndex = walks.findIndex((walk: Walk) => walk.id === activeWalkId);
      
      if (walkIndex !== -1) {
        walks[walkIndex].title = walkTitle;
        walks[walkIndex].notes = walkNotes || undefined;
        localStorage.setItem('walks', JSON.stringify(walks));
        
        // Update lokale state
        setActiveWalk({
          ...activeWalk,
          title: walkTitle,
          notes: walkNotes || undefined
        });
        
        setIsEditing(false);
      }
    }
  };

  const toggleTracking = () => {
    if (trackingEnabled && watchId !== null) {
      // Stop tracking
      stopRouteTracking(watchId);
      setWatchId(null);
    } else if (!trackingEnabled && activeWalkId) {
      // Start tracking
      const id = startRouteTracking(activeWalkId);
      setWatchId(id);
    }
    
    setTrackingEnabled(!trackingEnabled);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEditClick = () => {
    if (activeWalk) {
      setWalkTitle(activeWalk.title || '');
      setWalkNotes(activeWalk.notes || '');
      setIsEditing(true);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      {activeWalk ? (
        isEditing ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bewerk wandeling</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel
              </label>
              <input
                type="text"
                value={walkTitle}
                onChange={(e) => setWalkTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Geef je wandeling een titel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notities
              </label>
              <textarea
                value={walkNotes}
                onChange={(e) => setWalkNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Voeg notities toe over deze wandeling"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={updateWalk}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Opslaan
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Annuleren
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{activeWalk.title || 'Actieve wandeling'}</h3>
              <span className="text-sm text-gray-500">
                {formatDate(activeWalk.startTime)} {formatTime(activeWalk.startTime)}
              </span>
            </div>
            
            {activeWalk.notes && (
              <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm text-gray-700">
                {activeWalk.notes}
              </div>
            )}
            
            <div className="flex items-center mb-3">
              <div className={`w-3 h-3 rounded-full mr-2 ${trackingEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {trackingEnabled ? 'Route tracking actief' : 'Route tracking inactief'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={endWalk}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Wandeling beëindigen
              </button>
              <button
                onClick={toggleTracking}
                className={`px-4 py-2 ${trackingEnabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition`}
                title={trackingEnabled ? 'Schakel route tracking uit' : 'Schakel route tracking in'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          </div>
        )
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-2">Start een nieuwe wandeling</h3>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel (optioneel)
              </label>
              <input
                type="text"
                value={walkTitle}
                onChange={(e) => setWalkTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Geef je wandeling een titel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notities (optioneel)
              </label>
              <textarea
                value={walkNotes}
                onChange={(e) => setWalkNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Voeg notities toe over deze wandeling"
                rows={3}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="tracking-enabled"
                checked={trackingEnabled}
                onChange={() => setTrackingEnabled(!trackingEnabled)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="tracking-enabled" className="ml-2 block text-sm text-gray-700">
                Route tracking inschakelen
              </label>
            </div>
          </div>
          <button
            onClick={startWalk}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Nieuwe wandeling starten
          </button>
        </div>
      )}
    </div>
  );
} 