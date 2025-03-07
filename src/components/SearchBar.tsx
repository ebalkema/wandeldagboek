'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Observation } from '../lib/types';

interface SearchBarProps {
  observations: Observation[];
  onResultClick: (observationId: string) => void;
}

export default function SearchBar({ observations, onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Observation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Zoek in waarnemingen
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filteredResults = observations.filter(obs => {
      // Zoek in tekst, locatie en weer
      const text = obs.text.toLowerCase();
      const location = obs.location.toLowerCase();
      const weather = obs.weather.toLowerCase();
      
      // Een waarneming moet aan alle zoektermen voldoen
      return searchTerms.every(term => 
        text.includes(term) || location.includes(term) || weather.includes(term)
      );
    });
    
    setResults(filteredResults.slice(0, 5)); // Beperk tot 5 resultaten
  }, [query, observations]);

  // Sluit zoekresultaten als er buiten wordt geklikt
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Formateer datum
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Highlight zoektermen in tekst
  const highlightText = (text: string) => {
    if (query.trim() === '') return text;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      highlightedText = highlightedText.replace(regex, match => `<mark class="bg-yellow-200">${match}</mark>`);
    });
    
    return highlightedText;
  };

  // Truncate tekst
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Zoek in waarnemingen..."
          className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {query && (
          <button
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map(result => (
            <div
              key={result.id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              onClick={() => {
                onResultClick(result.id);
                setIsOpen(false);
                setQuery('');
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <div 
                  className="font-medium"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(truncateText(result.text, 50)) 
                  }}
                />
                <div className="text-xs text-gray-500">
                  {formatDate(result.date)}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="inline-block mr-3">
                  <span className="font-medium">Locatie:</span>{' '}
                  <span dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.location) 
                  }} />
                </span>
                <span className="inline-block">
                  <span className="font-medium">Weer:</span>{' '}
                  <span dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.weather) 
                  }} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && query && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Geen resultaten gevonden voor "{query}"
        </div>
      )}
    </div>
  );
} 