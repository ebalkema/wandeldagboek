'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string, audioUrl?: string) => void;
}

export default function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [manualTranscription, setManualTranscription] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setShowManualInput(true);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Fout bij het starten van de opname:', err);
      alert('Kon geen toegang krijgen tot de microfoon');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop alle tracks in de stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleManualTranscriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualTranscription(e.target.value);
  };

  const handleManualTranscriptionSubmit = () => {
    setTranscription(manualTranscription);
    onTranscriptionComplete(manualTranscription, audioUrl || undefined);
  };

  // Automatische transcriptie functie (momenteel uitgeschakeld, kan later worden geïmplementeerd)
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      
      // Hier zou je een API-aanroep kunnen doen naar een transcriptieservice
      // Voor nu simuleren we een vertraging en gebruiken we een standaardtekst
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const text = "Dit is een voorbeeld van automatische transcriptie. Implementeer een echte transcriptieservice voor productiegebruik.";
      setTranscription(text);
      onTranscriptionComplete(text, audioUrl || undefined);
      setIsTranscribing(false);
    } catch (err) {
      console.error('Fout bij transcriptie:', err);
      setIsTranscribing(false);
      setShowManualInput(true);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup: stop recording if component unmounts while recording
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Cleanup audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, audioUrl]);

  return (
    <div className="space-y-4">
      {!audioBlob ? (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-full font-semibold ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {isRecording ? 'Stop Opname' : 'Start Opname'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Opname beluisteren:</h3>
            <audio ref={audioRef} src={audioUrl || ''} controls className="w-full" />
          </div>
          
          {showManualInput && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Voer je waarneming in:</h3>
              <textarea
                value={manualTranscription}
                onChange={handleManualTranscriptionChange}
                placeholder="Typ hier wat je hebt waargenomen..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
              />
              <button
                onClick={handleManualTranscriptionSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Bevestigen
              </button>
            </div>
          )}
          
          {isTranscribing && (
            <div className="text-center p-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span>Bezig met transcriberen...</span>
            </div>
          )}
        </div>
      )}

      {isRecording && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            Aan het opnemen... Spreek duidelijk in de microfoon
          </div>
        </div>
      )}
    </div>
  );
} 