'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WalkManager from '../../components/WalkManager';
import AudioRecorder from '../../components/AudioRecorder';
import LocationMap from '../../components/LocationMap';
import { Observation } from '../../lib/types';
import { fetchWeather, WeatherData, getWeatherIconUrl, formatWeather } from '../../lib/weather';

export default function WaarnemingPage() {
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [transcription, setTranscription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [weather, setWeather] = useState('Onbekend');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showRecorder, setShowRecorder] = useState(true);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  
  const router = useRouter();

  const handleTranscriptionComplete = (text: string, url?: string) => {
    setTranscription(text);
    if (url) setAudioUrl(url);
    setShowRecorder(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);

      // Maak previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Haal bestaande observaties op
    const observations = JSON.parse(localStorage.getItem('observations') || '[]');
    
    // Maak nieuwe observatie
    const newObservation: Observation = {
      id: Date.now().toString(),
      text: transcription,
      audioUrl: audioUrl,
      photos: previews,
      location: location || 'Onbekende locatie',
      weather: weatherData ? formatWeather(weatherData) : weather,
      date: new Date().toISOString(),
    };
    
    // Haal actieve wandeling op (indien aanwezig)
    const activeWalkId = localStorage.getItem('activeWalkId');
    
    if (activeWalkId) {
      // Koppel observatie aan wandeling
      newObservation.walkId = activeWalkId;
      
      // Update de wandeling met de nieuwe observatie
      const walks = JSON.parse(localStorage.getItem('walks') || '[]');
      const walkIndex = walks.findIndex((walk: any) => walk.id === activeWalkId);
      
      if (walkIndex !== -1) {
        walks[walkIndex].observations.push(newObservation.id);
        localStorage.setItem('walks', JSON.stringify(walks));
      }
    }
    
    // Sla de nieuwe observatie op
    observations.push(newObservation);
    localStorage.setItem('observations', JSON.stringify(observations));
    
    setIsSaving(false);
    router.push('/dashboard');
  };

  const getWeatherData = async (latitude: number, longitude: number) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchWeather(latitude, longitude);
      setWeatherData(data);
      setWeather(formatWeather(data));
    } catch (error) {
      console.error('Fout bij het ophalen van weergegevens:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    // Probeer locatie op te halen
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          
          // Haal weergegevens op
          getWeatherData(latitude, longitude);
        },
        () => {
          setLocation('Locatie niet beschikbaar');
        }
      );
    }
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Terug naar home
      </Link>
      
      <h1 className="text-2xl font-bold">Nieuwe waarneming</h1>
      
      {/* Wandeling beheer component */}
      <WalkManager />
      
      <section className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Spreek je waarneming in</h2>
        
        <div className="space-y-6">
          {showRecorder ? (
            <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
          ) : (
            <>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Je waarneming:</h3>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {transcription}
                </div>
                
                {audioUrl && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Opname:</h3>
                    <audio src={audioUrl} controls className="w-full" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Voeg foto's toe (optioneel)</h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                />
                
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Locatie</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md mb-2"
                          placeholder="Voer locatie in"
                        />
                        
                        {coordinates && (
                          <LocationMap 
                            latitude={coordinates.latitude} 
                            longitude={coordinates.longitude}
                            popupText="Jouw locatie"
                            height="200px"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Weer</h3>
                        {isLoadingWeather ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                            <span>Weer ophalen...</span>
                          </div>
                        ) : weatherData ? (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <img 
                                src={getWeatherIconUrl(weatherData.icon)} 
                                alt={weatherData.description}
                                className="w-16 h-16"
                              />
                              <div>
                                <div className="font-semibold">{weatherData.description}</div>
                                <div className="text-2xl">{weatherData.temperature}°C</div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <div>Luchtvochtigheid: {weatherData.humidity}%</div>
                              <div>Windsnelheid: {weatherData.windSpeed} m/s</div>
                            </div>
                          </div>
                        ) : (
                          <select
                            value={weather}
                            onChange={(e) => setWeather(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="Zonnig">Zonnig</option>
                            <option value="Bewolkt">Bewolkt</option>
                            <option value="Regenachtig">Regenachtig</option>
                            <option value="Winderig">Winderig</option>
                            <option value="Mistig">Mistig</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-3 bg-blue-600 text-white rounded-lg ${
                      isSaving ? 'opacity-70' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isSaving ? 'Opslaan...' : 'Opslaan'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
} 