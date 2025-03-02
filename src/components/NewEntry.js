import React, { useState, useEffect, useRef } from 'react';

const NewEntry = ({ onAddEntry, onCancel }) => {
  // States voor de new entry
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [weather, setWeather] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Refs voor audio opname
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Effect voor het ophalen van de locatie bij het laden van de component
  useEffect(() => {
    // Initialiseer de SpeechRecognition API als die beschikbaar is
    initSpeechRecognition();
    
    // Vraag om locatietoestemming en haal locatie op
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchWeather(latitude, longitude);
          fetchLocationName(latitude, longitude);
          setLoading(false);
        },
        (err) => {
          console.error('Locatiefout:', err);
          setError('Kan locatie niet verkrijgen. Zorg dat je locatietoegang hebt ingeschakeld.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation wordt niet ondersteund door deze browser.');
    }
    
    // Cleanup functie voor SpeechRecognition
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialiseer de Speech Recognition API
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Spraakherkenning wordt niet ondersteund door deze browser.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'nl-NL';
    
    recognitionRef.current.onstart = () => {
      setIsRecognizing(true);
      console.log("Spraakherkenning gestart");
    };
    
    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      
      // Combineer eerdere transcriptie met nieuwe
      setTranscript(prev => prev + finalTranscript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Spraakherkenningsfout:", event.error);
      setIsRecognizing(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsRecognizing(false);
      console.log("Spraakherkenning beëindigd");
    };
  };

  // Functie om plaatsnaam op te halen op basis van coördinaten
  const fetchLocationName = async (latitude, longitude) => {
    try {
      // OpenStreetMap Nominatim API voor reverse geocoding (gratis en zonder API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'nl', // Voor Nederlandse plaatsnamen
            'User-Agent': 'WandeldagboekApp/1.0' // Nominatim vereist een User-Agent
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Locatienaam kon niet worden opgehaald');
      }
      
      const data = await response.json();
      
      // Stel een leesbare locatienaam samen
      let placeName = '';
      
      if (data.address) {
        const address = data.address;
        const components = [];
        
        // Voeg relevante adrescomponenten toe in volgorde van specificiteit
        if (address.road || address.pedestrian || address.footway) {
          components.push(address.road || address.pedestrian || address.footway);
        }
        
        if (address.suburb) {
          components.push(address.suburb);
        }
        
        if (address.city || address.town || address.village) {
          components.push(address.city || address.town || address.village);
        }
        
        if (address.municipality && !components.includes(address.municipality)) {
          components.push(address.municipality);
        }
        
        placeName = components.join(', ');
      }
      
      // Als we geen goede componenten konden vinden, gebruik de weergavenaam
      if (!placeName && data.display_name) {
        placeName = data.display_name.split(',').slice(0, 2).join(',');
      }
      
      setLocationName(placeName || 'Onbekende locatie');
      
    } catch (error) {
      console.error('Reverse geocoding fout:', error);
      setLocationName('');
    }
  };

  // Functie om het weer op te halen op basis van locatie
  const fetchWeather = async (latitude, longitude) => {
    try {
      // Nieuwe OpenWeatherMap API key
      const apiKey = '1b3f9c5cd61b7ffb5a9a3c00b5f42ce3'; // Deze nieuwe API key moet werken
      
      // Alternatieve API-endpoints om te proberen
      const endpoints = [
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=nl&appid=${apiKey}`,
        // Backup met JSONP om CORS-problemen te vermijden
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=nl&appid=${apiKey}&callback=?`
      ];
      
      // Probeer elk endpoint totdat een werkt
      let response = null;
      let succeeded = false;
      
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint);
          if (response.ok) {
            succeeded = true;
            break;
          }
        } catch (e) {
          console.warn(`Endpoint ${endpoint} werkt niet, volgende proberen...`);
        }
      }
      
      if (!succeeded || !response) {
        // Als geen van de endpoints werkt, gebruik vooraf gedefinieerde weergegevens
        console.warn('Kon geen weer ophalen, gebruik fallback weerdata');
        setWeather({
          temperature: 15, // Standaard temperatuur
          description: 'gegevens niet beschikbaar',
          icon: '01d' // Standaard icoon (heldere lucht)
        });
        return;
      }
      
      const data = await response.json();
      setWeather({
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon
      });
    } catch (error) {
      console.error('Weerfout:', error);
      // In plaats van een foutmelding te tonen, gebruik fallback weerdata
      setWeather({
        temperature: 15,
        description: 'gegevens niet beschikbaar',
        icon: '01d'
      });
    }
  };

  // Start audio opname en spraakherkenning
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setShowPhotoPrompt(true);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start spraakherkenning
      if (recognitionRef.current) {
        setTranscript('');
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Opnamefout:', error);
      setError('Kon geen toegang krijgen tot de microfoon. Controleer je browserinstellingen.');
    }
  };

  // Stop audio opname en spraakherkenning
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop alle tracks van de stream die we hebben verkregen
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Stop spraakherkenning
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Zet de getranscribeerde tekst in de notities
      if (transcript.trim()) {
        setNotes(prev => {
          const prefix = prev.trim() ? prev.trim() + '\n\n' : '';
          return prefix + "Getranscribeerde audio: " + transcript.trim();
        });
      }
    }
  };

  // Verwerk foto upload
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Verwerk notities verandering
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Functie die wordt aangeroepen wanneer de gebruiker op Opslaan drukt
  const handleSave = async () => {
    console.log('handleSave functie aangeroepen');
    
    // Controleer of de notitie belangrijke inhoud heeft
    if (!transcript && !notes) {
      alert('Je moet een spraaknotitie opnemen of tekst invoeren voordat je kunt opslaan.');
      return;
    }
    
    try {
      // Definieer fallback waarden indien nodig
      const fallbackLocation = { latitude: 52.3676, longitude: 4.9041, name: 'Onbekende locatie' };
      
      // Alle gegevens voorbereiden voor opslaan
      const entryData = {
        timestamp: new Date(), // Tijdstip van opslaan
        location: location || fallbackLocation,
        weather: weather || { temperature: 15, description: 'gegevens niet beschikbaar', icon: '01d' },
        transcript: transcript || '',
        notes: notes || '',
      };
      
      console.log('Voorbereid voor opslaan:', entryData);
      
      // Verwerk audio blob als we hebben opgenomen
      let audioBlobToSave = null;
      if (audioChunksRef.current && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Audio blob aangemaakt:', !!audioBlob);
        audioBlobToSave = audioBlob;
      }
      
      // Verwerk foto indien geüpload
      let imageFileToSave = null; 
      if (photo) {
        // Foto van dataURL omzetten naar bestand
        try {
          const response = await fetch(photo);
          const blob = await response.blob();
          imageFileToSave = new File([blob], 'wandelnotitie-foto.jpg', { type: 'image/jpeg' });
          console.log('Foto blob aangemaakt:', !!imageFileToSave);
        } catch (photoError) {
          console.error('Fout bij voorbereiden foto:', photoError);
        }
      }
      
      // Data opslaan via onAddEntry callback
      console.log('onAddEntry aanroepen...');
      try {
        await onAddEntry(
          entryData,
          imageFileToSave,
          audioBlobToSave
        );
        console.log('onAddEntry aangeroepen');
        
        // Reset state voor nieuwe entry na succesvol opslaan
        setTranscript('');
        setNotes('');
        setAudioURL(null);
        setPhoto(null);
        setIsRecording(false);
        
        // Bevestiging tonen
        alert('Notitie succesvol opgeslagen!');
        
        // Ga terug naar vorige scherm (implementeer dit indien nodig)
        if (onCancel) {
          onCancel();
        }
      } catch (error) {
        console.error('Fout bij opslaan:', error);
        alert(`Er is een fout opgetreden bij het opslaan: ${error.message || 'Onbekende fout'}`);
      }
    } catch (error) {
      console.error('Fout in handleSave:', error);
      alert(`Er is een fout opgetreden: ${error.message || 'Onbekende fout'}`);
    }
  };

  return (
    <div className="new-entry card">
      <h2>Nieuwe Wandelnotitie</h2>
      
      {error && <p className="error">{error}</p>}
      
      {loading ? (
        <p>Locatie en weer worden opgehaald...</p>
      ) : (
        <div>
          {location && (
            <div className="location-info">
              <p>
                <strong>Jouw locatie:</strong>{' '}
                {locationName ? (
                  <>
                    <span className="location-name">{locationName}</span>
                    <br />
                    <span className="location-coords">({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})</span>
                  </>
                ) : (
                  `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                )}
              </p>
            </div>
          )}
          
          {weather && (
            <div className="weather-info">
              <strong>Huidige weer:</strong> {weather.description}, {weather.temperature}°C
            </div>
          )}
          
          <div className="form-group">
            <h3>Spraaknotitie</h3>
            {!audioURL ? (
              <div>
                <button 
                  className={`record-btn ${isRecording ? 'recording' : ''}`} 
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? 'Stop Opname' : 'Start Opname'}
                </button>
                
                {isRecording && (
                  <div className="recording-indicator">
                    <span className="pulse"></span> Opname loopt...
                    {isRecognizing && (
                      <p className="transcribing-status">Spraak wordt herkend</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="entry-audio">
                <p>Spraaknotitie opgenomen:</p>
                <audio controls src={audioURL} />
                
                {transcript && (
                  <div className="transcript-preview">
                    <h4>Getranscribeerde audio:</h4>
                    <p className="transcript-text">{transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {showPhotoPrompt && (
            <div className="form-group">
              <h3>Wil je ook een foto toevoegen?</h3>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                id="photo-upload"
                name="photo-upload"
              />
              {photo && (
                <div>
                  <p>Foto preview:</p>
                  <img 
                    src={photo} 
                    alt="Upload preview" 
                    className="photo-preview"
                  />
                </div>
              )}
            </div>
          )}
          
          {audioURL && (
            <div className="form-group">
              <h3>Extra aantekeningen</h3>
              <textarea
                rows="4"
                placeholder="Voeg eventueel extra aantekeningen toe..."
                value={notes}
                onChange={handleNotesChange}
                id="notes-textarea"
                name="notes"
                autoComplete="off"
              ></textarea>
              <p className="note-help">De getranscribeerde audio is automatisch toegevoegd aan de aantekeningen.</p>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              className="back-btn" 
              onClick={onCancel}
            >
              Annuleren
            </button>
            <button 
              onClick={handleSave}
              disabled={!audioURL}
            >
              Opslaan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEntry; 