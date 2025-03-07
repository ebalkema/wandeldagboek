'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NatureFacts {
  month: string;
  facts: string[];
  birdOfTheMonth: {
    name: string;
    description: string;
    imageUrl?: string;
  };
}

export default function NatuurFeitjes() {
  const [currentMonth, setCurrentMonth] = useState('');
  
  useEffect(() => {
    const months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
                   'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    const date = new Date();
    setCurrentMonth(months[date.getMonth()]);
  }, []);
  
  // Voorbeeld data voor natuurfeitjes
  const facts: NatureFacts = {
    month: currentMonth,
    facts: [
      'De eerste zwaluwen keren terug uit Afrika',
      'Voorjaarsbloemen staan in volle bloei',
      'Veel vogels beginnen met nestbouw',
      'De dieren worden actiever na de winter',
      'De dagen worden langer, perfect voor wandelingen!'
    ],
    birdOfTheMonth: {
      name: 'Boerenzwaluw',
      description: 'Een sierlijke vogel die bekend staat om zijn lange staart en acrobatische vliegkunsten. De boerenzwaluw keert in het voorjaar terug uit Afrika en bouwt zijn nest vaak in schuren en stallen.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Barn_Swallow_%28Hirundo_rustica%29_RWD3.jpg/640px-Barn_Swallow_%28Hirundo_rustica%29_RWD3.jpg'
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Terug naar home
      </Link>
      
      <h1 className="text-2xl font-bold">Natuurfeitjes {facts.month}</h1>
      
      <section className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Wist je dat...</h2>
            <ul className="list-disc pl-5 space-y-2">
              {facts.facts.map((fact, index) => (
                <li key={index}>{fact}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Vogel van de maand</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold">{facts.birdOfTheMonth.name}</h3>
              <p className="mt-2">{facts.birdOfTheMonth.description}</p>
              
              {facts.birdOfTheMonth.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={facts.birdOfTheMonth.imageUrl} 
                    alt={facts.birdOfTheMonth.name}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 