'use client';

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

export default function MonthlyNatureFacts() {
  const [facts, setFacts] = useState<NatureFacts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementeer API call naar backend voor maandelijkse feiten
    // Voorlopig gebruiken we dummy data
    setFacts({
      month: 'April',
      facts: [
        'De eerste zwaluwen keren terug uit Afrika',
        'Voorjaarsbloemen staan in volle bloei',
        'Veel vogels beginnen met nestbouw'
      ],
      birdOfTheMonth: {
        name: 'Boerenzwaluw',
        description: 'Een sierlijke vogel die bekend staat om zijn lange staart en acrobatische vliegkunsten.'
      }
    });
    setLoading(false);
  }, []);

  if (loading) return <div>Laden...</div>;
  if (!facts) return <div>Geen gegevens beschikbaar</div>;

  return (
    <section className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Natuurfeiten {facts.month}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">Wist je dat...</h3>
          <ul className="list-disc pl-5 space-y-2">
            {facts.facts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3">Vogel van de maand</h3>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold">{facts.birdOfTheMonth.name}</h4>
            <p className="mt-2">{facts.birdOfTheMonth.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
} 