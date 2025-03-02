import React, { useState, useEffect, useRef, useCallback } from 'react';

const NewEntry = ({ onAddEntry, onCancel }) => {
  // States voor de new entry
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Refs voor audio opname
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Functie om locatie op te halen
  const fetchLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchLocationName(latitude, longitude);
          setIsLoadingLocation(false);
        },
        (err) => {
          console.error('Locatiefout:', err);
          setError('Kan locatie niet verkrijgen. Zorg dat je locatietoegang hebt ingeschakeld.');
          setIsLoadingLocation(false);
        }
      );
    } else {
      setError('Geolocation wordt niet ondersteund door deze browser.');
    }
  }, []);

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

  // Effect voor het initialiseren van de spraakherkenning bij het laden van de component
  useEffect(() => {
    // Initialiseer de SpeechRecognition API als die beschikbaar is
    initSpeechRecognition();
    
    // Start het ophalen van locatie op de achtergrond
    fetchLocation();
    
    // Cleanup functie voor SpeechRecognition
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [fetchLocation]);

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

  // Start audio opname en spraakherkenning
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Maak een nieuwe MediaRecorder instantie
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Event handler voor wanneer data beschikbaar is
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Event handler voor wanneer opname stopt
      mediaRecorder.onstop = () => {
        // Maak een blob van de opgenomen audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Maak een URL voor de blob
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Stop alle tracks in de stream
        stream.getTracks().forEach(track => track.stop());
        
        // Toon de foto prompt na het opnemen van audio
        setShowPhotoPrompt(true);
      };
      
      // Start de opname
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start spraakherkenning als die beschikbaar is
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
    } catch (error) {
      console.error('Fout bij starten opname:', error);
      setError('Kan geen toegang krijgen tot de microfoon. Controleer je browserinstellingen.');
    }
  };

  // Stop audio opname en spraakherkenning
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop spraakherkenning
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  // Verwerk foto upload
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Genereer een betekenisvolle naam voor de wandelnotitie
  const generateEntryName = () => {
    // Locatiedeel
    let locationPart = 'Wandeling';
    if (locationName) {
      // Neem alleen het eerste deel van de locatienaam (voor de eerste komma)
      locationPart = locationName.split(',')[0].trim();
    }
    
    // Datum en tijd
    const now = new Date();
    const dateStr = now.toLocaleDateString('nl-NL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    const timeStr = now.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Combineer de delen tot een betekenisvolle naam
    return `${locationPart} - ${dateStr} ${timeStr}`;
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
      
      // Genereer een betekenisvolle naam voor de wandelnotitie
      const entryTitle = generateEntryName();
      
      // Alle gegevens voorbereiden voor opslaan
      const entryData = {
        title: entryTitle, // Voeg de gegenereerde titel toe
        timestamp: new Date(), // Tijdstip van opslaan
        location: location || fallbackLocation,
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
          console.error('Fout bij verwerken foto:', photoError);
        }
      }
      
      // Roep de callback aan om de entry toe te voegen
      onAddEntry(entryData, audioBlobToSave, imageFileToSave);
      
    } catch (error) {
      console.error('Fout bij opslaan:', error);
      setError('Er is een fout opgetreden bij het opslaan van je notitie. Probeer het opnieuw.');
    }
  };

  return (
    <div className="new-entry">
      <h2>Nieuwe Wandelnotitie</h2>
      
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="entry-form">
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
        
        {/* Locatie informatie (wordt op de achtergrond geladen) */}
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
                <>
                  {isLoadingLocation ? 'Locatienaam wordt opgehaald...' : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </>
              )}
            </p>
          </div>
        )}
        
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
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
        
        <div className="form-actions">
          <button className="secondary" onClick={onCancel}>Annuleren</button>
          {audioURL && (
            <button className="primary-btn" onClick={handleSave}>Opslaan</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewEntry; 