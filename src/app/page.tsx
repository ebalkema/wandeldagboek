import React from 'react';
import Button from '../components/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">Wandeldagboek</h1>
      <p className="text-xl mb-8">Jouw persoonlijke wandellogboek - Nu op GitHub Pages!</p>
      
      <div className="flex gap-4 mb-8">
        <Button variant="primary">Nieuwe wandeling</Button>
        <Button variant="secondary">Bekijk wandelingen</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Wandelingen bijhouden</h2>
          <p>Houd al je wandelingen bij met datum, locatie, afstand en meer.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Foto's toevoegen</h2>
          <p>Voeg foto's toe aan je wandelingen om je herinneringen vast te leggen.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Statistieken bekijken</h2>
          <p>Bekijk statistieken over je wandelingen, zoals totale afstand en tijd.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Routes delen</h2>
          <p>Deel je favoriete routes met vrienden en familie.</p>
        </div>
      </div>
    </div>
  );
} 