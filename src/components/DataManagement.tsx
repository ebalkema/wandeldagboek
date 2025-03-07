'use client';

import React, { useState } from 'react';

export default function DataManagement() {
  const [importStatus, setImportStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = () => {
    setIsExporting(true);
    
    try {
      const walks = localStorage.getItem('walks') || '[]';
      const observations = localStorage.getItem('observations') || '[]';
      
      const data = {
        walks: JSON.parse(walks),
        observations: JSON.parse(observations),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `wandeldagboek-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setImportStatus('Gegevens succesvol geëxporteerd!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      console.error('Fout bij exporteren:', error);
      setImportStatus('Fout bij exporteren');
      setTimeout(() => setImportStatus(''), 3000);
    } finally {
      setIsExporting(false);
    }
  };
  
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportStatus('Bezig met importeren...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.walks && data.observations) {
          localStorage.setItem('walks', JSON.stringify(data.walks));
          localStorage.setItem('observations', JSON.stringify(data.observations));
          setImportStatus('Gegevens succesvol geïmporteerd! De pagina wordt herladen...');
          
          // Herlaad de pagina om de nieuwe gegevens weer te geven
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setImportStatus('Ongeldig bestandsformaat');
          setTimeout(() => setImportStatus(''), 3000);
        }
      } catch (error) {
        console.error('Fout bij importeren:', error);
        setImportStatus('Fout bij importeren');
        setTimeout(() => setImportStatus(''), 3000);
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      setImportStatus('Fout bij het lezen van het bestand');
      setIsImporting(false);
      setTimeout(() => setImportStatus(''), 3000);
    };
    
    reader.readAsText(file);
  };
  
  const clearAllData = () => {
    if (window.confirm('Weet je zeker dat je alle gegevens wilt wissen? Dit kan niet ongedaan worden gemaakt!')) {
      localStorage.removeItem('walks');
      localStorage.removeItem('observations');
      localStorage.removeItem('activeWalkId');
      
      setImportStatus('Alle gegevens zijn gewist! De pagina wordt herladen...');
      
      // Herlaad de pagina om de wijzigingen weer te geven
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Gegevensbeheer</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Exporteren</h3>
          <p className="text-gray-600 mb-2">
            Exporteer al je wandelingen en waarnemingen naar een JSON-bestand dat je kunt opslaan als back-up.
          </p>
          <button
            onClick={exportData}
            disabled={isExporting}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporteren...
              </span>
            ) : 'Exporteer gegevens'}
          </button>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Importeren</h3>
          <p className="text-gray-600 mb-2">
            Importeer wandelingen en waarnemingen uit een eerder geëxporteerd JSON-bestand.
          </p>
          <div className="flex items-center space-x-2">
            <label className="block">
              <span className="sr-only">Kies een bestand</span>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                disabled={isImporting}
                className={`block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 ${isImporting ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </label>
            {isImporting && (
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Gegevens wissen</h3>
          <p className="text-gray-600 mb-2">
            Wis alle opgeslagen wandelingen en waarnemingen. Dit kan niet ongedaan worden gemaakt!
          </p>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Alle gegevens wissen
          </button>
        </div>
        
        {importStatus && (
          <div className={`p-3 rounded-lg ${
            importStatus.includes('succesvol') ? 'bg-green-100 text-green-800' : 
            importStatus.includes('Bezig') ? 'bg-blue-100 text-blue-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
} 